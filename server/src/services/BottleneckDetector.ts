import { PerformanceMetrics, PerformanceService } from './PerformanceService';
import { logger } from '../utils/logger';

export interface BottleneckDetectionResult {
  operation: string;
  isBottleneck: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metrics: {
    executionTime: number;
    threshold: number;
  };
  recommendations: string[];
}

export interface PerformanceThresholds {
  encryption: number;   // ms
  decryption: number;   // ms
  zkProof: number;      // ms
  keyDerivation: number; // ms
  errorRate: number;    // percentage
  memoryUsage: number;  // percentage
  cpuUsage: number;     // percentage
}

export class BottleneckDetector {
  private static instance: BottleneckDetector;
  private thresholds: PerformanceThresholds;
  
  private constructor() {
    // Default thresholds - can be configured
    this.thresholds = {
      encryption: 1000,     // 1 second
      decryption: 800,      // 0.8 seconds
      zkProof: 5000,        // 5 seconds
      keyDerivation: 2000,  // 2 seconds
      errorRate: 0.05,      // 5% error rate
      memoryUsage: 80,      // 80% memory usage
      cpuUsage: 85          // 85% CPU usage
    };
  }
  
  static getInstance(): BottleneckDetector {
    if (!BottleneckDetector.instance) {
      BottleneckDetector.instance = new BottleneckDetector();
    }
    return BottleneckDetector.instance;
  }
  
  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  /**
   * Detect bottlenecks in performance metrics
   */
  async detectBottlenecks(): Promise<BottleneckDetectionResult[]> {
    const results: BottleneckDetectionResult[] = [];
    
    // Get all operation metrics
    const metrics = await PerformanceService.getMetrics();
    
    for (const operationMetric of metrics) {
      const result = this.analyzeOperation(operationMetric);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }
  
  /**
   * Analyze a single operation for bottlenecks
   */
  private analyzeOperation(operationMetric: any): BottleneckDetectionResult | null {
    const { operation, avgExecutionTime, errorRate } = operationMetric;
    
    let isBottleneck = false;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const recommendations: string[] = [];
    
    // Check execution time
    let executionThreshold = this.thresholds.encryption; // default
    switch (operation) {
      case 'encrypt':
      case 'aes256-encrypt':
        executionThreshold = this.thresholds.encryption;
        break;
      case 'decrypt':
      case 'aes256-decrypt':
        executionThreshold = this.thresholds.decryption;
        break;
      case 'zk-proof':
      case 'range-proof':
      case 'balance-proof':
        executionThreshold = this.thresholds.zkProof;
        break;
      case 'key-derivation':
        executionThreshold = this.thresholds.keyDerivation;
        break;
      default:
        executionThreshold = this.thresholds.encryption; // default
    }
    
    if (avgExecutionTime > executionThreshold) {
      isBottleneck = true;
      
      // Determine severity based on how much it exceeds threshold
      const excessRatio = avgExecutionTime / executionThreshold;
      if (excessRatio > 3) {
        severity = 'critical';
      } else if (excessRatio > 2) {
        severity = 'high';
      } else if (excessRatio > 1.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
      
      recommendations.push(
        `Average execution time (${avgExecutionTime.toFixed(2)}ms) exceeds threshold (${executionThreshold}ms). Consider optimizing this operation.`
      );
    }
    
    // Check error rate
    if (errorRate > this.thresholds.errorRate) {
      isBottleneck = true;
      if (errorRate > this.thresholds.errorRate * 2) {
        severity = 'high'; // Override severity if error rate is very high
      }
      
      recommendations.push(
        `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${(this.thresholds.errorRate * 100).toFixed(2)}%). Check for system issues.`
      );
    }
    
    if (!isBottleneck) {
      return null;
    }
    
    return {
      operation,
      isBottleneck,
      severity,
      metrics: {
        executionTime: avgExecutionTime,
        threshold: executionThreshold
      },
      recommendations
    };
  }
  
  /**
   * Get detailed bottleneck analysis for a specific operation
   */
  async getOperationBottleneckAnalysis(
    operation: string
  ): Promise<BottleneckDetectionResult | null> {
    const operationMetrics = await PerformanceService.getOperationMetrics(operation);
    return this.analyzeOperation(operationMetrics);
  }
  
  /**
   * Detect real-time bottlenecks from incoming metrics
   */
  detectRealtimeBottleneck(metrics: PerformanceMetrics): BottleneckDetectionResult | null {
    let isBottleneck = false;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const recommendations: string[] = [];
    
    // Determine threshold based on operation type
    let executionThreshold = this.thresholds.encryption;
    switch (metrics.operation) {
      case 'encrypt':
      case 'aes256-encrypt':
        executionThreshold = this.thresholds.encryption;
        break;
      case 'decrypt':
      case 'aes256-decrypt':
        executionThreshold = this.thresholds.decryption;
        break;
      case 'zk-proof':
      case 'range-proof':
      case 'balance-proof':
        executionThreshold = this.thresholds.zkProof;
        break;
      case 'key-derivation':
        executionThreshold = this.thresholds.keyDerivation;
        break;
      default:
        executionThreshold = this.thresholds.encryption;
    }
    
    // Check if execution time exceeds threshold
    if (metrics.executionTime > executionThreshold) {
      isBottleneck = true;
      
      const excessRatio = metrics.executionTime / executionThreshold;
      if (excessRatio > 3) {
        severity = 'critical';
      } else if (excessRatio > 2) {
        severity = 'high';
      } else if (excessRatio > 1.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
      
      recommendations.push(
        `Execution time (${metrics.executionTime}ms) exceeded threshold (${executionThreshold}ms).`
      );
      
      logger.warn('Performance bottleneck detected', {
        operation: metrics.operation,
        executionTime: metrics.executionTime,
        threshold: executionThreshold,
        severity
      });
    }
    
    // Check for errors
    if (!metrics.success) {
      isBottleneck = true;
      severity = 'high'; // Errors are serious
      
      recommendations.push(
        `Operation failed with error: ${metrics.error || 'Unknown error'}.`
      );
      
      logger.error('Operation error detected', {
        operation: metrics.operation,
        error: metrics.error
      });
    }
    
    if (!isBottleneck) {
      return null;
    }
    
    return {
      operation: metrics.operation,
      isBottleneck,
      severity,
      metrics: {
        executionTime: metrics.executionTime,
        threshold: executionThreshold
      },
      recommendations
    };
  }
  
  /**
   * Get current system resource usage
   */
  getSystemResourceUsage(): { 
    memoryUsage: number; 
    cpuUsage: number; 
    isUnderPressure: boolean 
  } {
    const memoryUsage = process.memoryUsage();
    const memoryUsed = memoryUsage.heapUsed;
    const memoryTotal = memoryUsage.heapTotal;
    const memoryPercentage = (memoryUsed / memoryTotal) * 100;
    
    // For CPU usage, we'll use a simple approximation
    // In a real implementation, you'd use a library like 'pidusage'
    const cpuUsage = process.cpuUsage();
    const cpuPercentage = Math.min(100, (cpuUsage.user + cpuUsage.system) / 10000000); // Rough estimation
    
    const isUnderPressure = 
      memoryPercentage > this.thresholds.memoryUsage || 
      cpuPercentage > this.thresholds.cpuUsage;
    
    return {
      memoryUsage: parseFloat(memoryPercentage.toFixed(2)),
      cpuUsage: parseFloat(cpuPercentage.toFixed(2)),
      isUnderPressure
    };
  }
  
  /**
   * Get system bottleneck alerts
   */
  getSystemBottleneckAlerts(): BottleneckDetectionResult[] {
    const alerts: BottleneckDetectionResult[] = [];
    const resources = this.getSystemResourceUsage();
    
    if (resources.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push({
        operation: 'system-memory',
        isBottleneck: true,
        severity: resources.memoryUsage > this.thresholds.memoryUsage * 1.5 ? 'high' : 'medium',
        metrics: {
          executionTime: resources.memoryUsage,
          threshold: this.thresholds.memoryUsage
        },
        recommendations: [`Memory usage (${resources.memoryUsage}%) exceeds threshold (${this.thresholds.memoryUsage}%). Consider optimizing memory usage or scaling resources.`]
      });
    }
    
    if (resources.cpuUsage > this.thresholds.cpuUsage) {
      alerts.push({
        operation: 'system-cpu',
        isBottleneck: true,
        severity: resources.cpuUsage > this.thresholds.cpuUsage * 1.5 ? 'high' : 'medium',
        metrics: {
          executionTime: resources.cpuUsage,
          threshold: this.thresholds.cpuUsage
        },
        recommendations: [`CPU usage (${resources.cpuUsage}%) exceeds threshold (${this.thresholds.cpuUsage}%). Consider optimizing CPU-intensive operations.`]
      });
    }
    
    return alerts;
  }
}