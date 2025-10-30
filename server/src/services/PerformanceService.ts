import { logger } from '../utils/logger';

export interface PerformanceMetrics {
  operation: string;
  executionTime: number; // in milliseconds
  memoryUsage: number; // in bytes
  cpuUsage: number; // percentage
  timestamp: Date;
  success: boolean;
  error?: string;
  dataSize?: number;
}

export interface OperationMetrics {
  operation: string;
  avgExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  totalExecutions: number;
  successRate: number;
  errorRate: number;
  throughput: number; // operations per second
  percentile95: number;
  percentile99: number;
}

export interface PerformanceAlert {
  id: string;
  operation: string;
  type: 'slow_execution' | 'high_error_rate' | 'memory_leak' | 'high_cpu';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceTrend {
  operation: string;
  period: string; // 'hour', 'day', 'week', 'month'
  data: Array<{
    timestamp: Date;
    avgExecutionTime: number;
    totalOperations: number;
    errorRate: number;
  }>;
}

export class PerformanceService {
  private static metrics: PerformanceMetrics[] = [];
  private static alerts: PerformanceAlert[] = [];
  private static readonly MAX_METRICS = 10000; // Keep last 10k metrics
  private static readonly MAX_ALERTS = 1000; // Keep last 1k alerts

  /**
   * Record performance metrics for an operation
   */
  static recordMetrics(metrics: PerformanceMetrics): void {
    // Add the metrics to our collection
    this.metrics.push(metrics);

    // Maintain size limits
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Check for performance issues that might trigger alerts
    this.checkForPerformanceIssues(metrics);
  }

  /**
   * Get overall performance metrics
   */
  static async getMetrics(): Promise<OperationMetrics[]> {
    const uniqueOperations = [...new Set(this.metrics.map(m => m.operation))];
    
    return uniqueOperations.map(operation => {
      const ops = this.metrics.filter(m => m.operation === operation);
      
      if (ops.length === 0) {
        return {
          operation,
          avgExecutionTime: 0,
          minExecutionTime: 0,
          maxExecutionTime: 0,
          totalExecutions: 0,
          successRate: 0,
          errorRate: 0,
          throughput: 0,
          percentile95: 0,
          percentile99: 0
        };
      }

      const executionTimes = ops.map(m => m.executionTime).sort((a, b) => a - b);
      const totalExecutions = ops.length;
      const successfulExecutions = ops.filter(m => m.success).length;
      const errors = ops.filter(m => !m.success).length;
      
      // Calculate average execution time
      const totalExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0);
      const avgExecutionTime = totalExecutionTime / totalExecutions;
      
      // Calculate percentiles
      const percentile95Index = Math.floor(0.95 * executionTimes.length);
      const percentile99Index = Math.floor(0.99 * executionTimes.length);
      
      // Calculate throughput (operations per second in last minute)
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentOps = ops.filter(m => m.timestamp > oneMinuteAgo);
      const throughput = recentOps.length / 60; // per second average

      return {
        operation,
        avgExecutionTime,
        minExecutionTime: executionTimes[0],
        maxExecutionTime: executionTimes[executionTimes.length - 1],
        totalExecutions,
        successRate: successfulExecutions / totalExecutions,
        errorRate: errors / totalExecutions,
        throughput,
        percentile95: executionTimes[percentile95Index],
        percentile99: executionTimes[percentile99Index]
      };
    });
  }

  /**
   * Get metrics for a specific operation
   */
  static async getOperationMetrics(
    operation: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<OperationMetrics> {
    let ops = this.metrics.filter(m => m.operation === operation);
    
    // Apply time filters if provided
    if (startTime) {
      ops = ops.filter(m => m.timestamp >= startTime);
    }
    if (endTime) {
      ops = ops.filter(m => m.timestamp <= endTime);
    }
    
    if (ops.length === 0) {
      return {
        operation,
        avgExecutionTime: 0,
        minExecutionTime: 0,
        maxExecutionTime: 0,
        totalExecutions: 0,
        successRate: 0,
        errorRate: 0,
        throughput: 0,
        percentile95: 0,
        percentile99: 0
      };
    }

    const executionTimes = ops.map(m => m.executionTime).sort((a, b) => a - b);
    const totalExecutions = ops.length;
    const successfulExecutions = ops.filter(m => m.success).length;
    const errors = ops.filter(m => !m.success).length;
    
    // Calculate average execution time
    const totalExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0);
    const avgExecutionTime = totalExecutionTime / totalExecutions;
    
    // Calculate percentiles
    const percentile95Index = Math.floor(0.95 * executionTimes.length);
    const percentile99Index = Math.floor(0.99 * executionTimes.length);
    
    // Calculate throughput (operations per second in last minute)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentOps = ops.filter(m => m.timestamp > oneMinuteAgo);
    const throughput = recentOps.length / 60; // per second average

    return {
      operation,
      avgExecutionTime,
      minExecutionTime: executionTimes[0],
      maxExecutionTime: executionTimes[executionTimes.length - 1],
      totalExecutions,
      successRate: successfulExecutions / totalExecutions,
      errorRate: errors / totalExecutions,
      throughput,
      percentile95: executionTimes[percentile95Index],
      percentile99: executionTimes[percentile99Index]
    };
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(
    operation?: string,
    period: string = 'day'
  ): Promise<PerformanceTrend[]> {
    let ops = this.metrics;
    
    if (operation) {
      ops = ops.filter(m => m.operation === operation);
    }
    
    // Group metrics by time period
    const groupedMetrics = this.groupByTimePeriod(ops, period);
    
    return Object.entries(groupedMetrics).map(([op, metrics]) => {
      return {
        operation: op,
        period,
        data: metrics.map(m => ({
          timestamp: m.timestamp,
          avgExecutionTime: m.executionTime,
          totalOperations: 1, // This would need aggregation
          errorRate: m.success ? 0 : 1
        }))
      };
    });
  }

  /**
   * Get performance alerts
   */
  static async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    // Return only unresolved alerts
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Group metrics by time period for trend analysis
   */
  private static groupByTimePeriod(
    metrics: PerformanceMetrics[],
    period: string
  ): Record<string, PerformanceMetrics[]> {
    const grouped: Record<string, PerformanceMetrics[]> = {};
    
    metrics.forEach(metric => {
      // Group by operation first
      if (!grouped[metric.operation]) {
        grouped[metric.operation] = [];
      }
      grouped[metric.operation].push(metric);
    });
    
    return grouped;
  }

  /**
   * Check for performance issues and create alerts if needed
   */
  private static checkForPerformanceIssues(metrics: PerformanceMetrics): void {
    // Use bottleneck detector to identify issues
    import('./BottleneckDetector').then(({ BottleneckDetector }) => {
      const detector = BottleneckDetector.getInstance();
      const bottleneck = detector.detectRealtimeBottleneck(metrics);
      
      if (bottleneck && bottleneck.isBottleneck) {
        this.createAlert({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          operation: metrics.operation,
          type: bottleneck.severity === 'critical' || bottleneck.severity === 'high' 
            ? 'slow_execution' : 'high_error_rate',
          message: bottleneck.recommendations.join('; '),
          severity: bottleneck.severity,
          timestamp: new Date(),
          resolved: false
        });
      }
    }).catch((err: unknown) => {
      const error = err as Error;
      logger.error('Error in bottleneck detection', { error: error.message });
    });

    // Fallback checks
    if (metrics.executionTime > 5000) { // 5 seconds
      this.createAlert({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation: metrics.operation,
        type: 'slow_execution',
        message: `Slow execution detected: ${metrics.executionTime}ms for ${metrics.operation}`,
        severity: 'high',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check for errors
    if (!metrics.success) {
      this.createAlert({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation: metrics.operation,
        type: 'high_error_rate',
        message: `Error in ${metrics.operation}: ${metrics.error}`,
        severity: 'medium',
        timestamp: new Date(),
        resolved: false
      });
    }
  }

  /**
   * Create and store a performance alert
   */
  private static createAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Maintain size limits
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }
    
    // Log the alert
    logger.warn(`Performance Alert: ${alert.message}`, {
      operation: alert.operation,
      severity: alert.severity,
      type: alert.type
    });
  }

  /**
   * Clear old metrics to manage memory usage
   */
  static cleanup(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour ago
    
    // Remove old metrics
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    // Remove resolved alerts older than 24 hours
    const oneDayAgo = new Date(now.getTime() - 86400000); // 24 hours ago
    this.alerts = this.alerts.filter(a => !a.resolved || a.timestamp > oneDayAgo);
  }

  /**
   * Reset all performance data (for testing purposes)
   */
  static reset(): void {
    this.metrics = [];
    this.alerts = [];
  }
}