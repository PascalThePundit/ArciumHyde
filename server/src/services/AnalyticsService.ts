import { BillingService } from './BillingService';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';

export interface UsageStats {
  totalRequests: number;
  requestsByService: Record<string, number>;
  totalRevenue: number;
  activeUsers: number;
  newUsersToday: number;
  usageByHour: Record<string, number>;
  topServices: Array<{ service: string; count: number }>;
}

export interface UserUsage {
  totalOperations: number;
  operationsByService: Record<string, number>;
  totalCost: number;
  lastActive: Date;
  requestsByHour: Record<string, number>;
}

export interface ServiceHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export class AnalyticsService {
  /**
   * Get overall usage statistics for the platform
   */
  static async getUsageStats(): Promise<UsageStats> {
    // Get all usage records from billing service
    // For this implementation, we'll simulate the data
    // In a real implementation, we would aggregate actual usage data
    
    // This is a simplified implementation - in reality, you'd query a database
    // that tracks all API requests
    
    return {
      totalRequests: 12540,
      requestsByService: {
        'encryption': 3200,
        'zk-proof': 5100,
        'selective-disclosure': 2800,
        'other': 1440
      },
      totalRevenue: 2450.75, // In credits
      activeUsers: 245,
      newUsersToday: 8,
      usageByHour: {
        '0': 45,   // Midnight hour
        '1': 32,
        '2': 28,
        '3': 19,
        '4': 22,
        '5': 35,
        '6': 67,
        '7': 120,
        '8': 210,
        '9': 320,
        '10': 410,
        '11': 520,
        '12': 580,
        '13': 620,
        '14': 590,
        '15': 560,
        '16': 510,
        '17': 480,
        '18': 420,
        '19': 380,
        '20': 310,
        '21': 250,
        '22': 180,
        '23': 120  // 11 PM hour
      },
      topServices: [
        { service: 'zk-proof', count: 5100 },
        { service: 'encryption', count: 3200 },
        { service: 'selective-disclosure', count: 2800 }
      ]
    };
  }

  /**
   * Get usage statistics for a specific user
   */
  static async getUserUsage(apiKey: string): Promise<UserUsage> {
    // Get user's usage from billing service
    try {
      const usageData = await BillingService.getUsage(apiKey);
      
      // Aggregate the data
      const operationsByService: Record<string, number> = {};
      let totalOperations = 0;
      let totalCost = 0;
      const requestsByHour: Record<string, number> = {};
      
      // Initialize hourly stats
      for (let i = 0; i < 24; i++) {
        requestsByHour[i.toString()] = 0;
      }
      
      usageData.records.forEach((record: any) => {
        // Count by service
        operationsByService[record.serviceType] = (operationsByService[record.serviceType] || 0) + 1;
        
        // Total operations
        totalOperations++;
        
        // Total cost
        totalCost += record.cost;
        
        // Aggregate by hour
        const hour = new Date(record.timestamp).getHours().toString();
        requestsByHour[hour] = (requestsByHour[hour] || 0) + 1;
      });
      
      // Get last active time
      const lastActive = usageData.records.length > 0 
        ? new Date(Math.max(...usageData.records.map((r: any) => new Date(r.timestamp).getTime())))
        : new Date();
      
      return {
        totalOperations,
        operationsByService,
        totalCost,
        lastActive,
        requestsByHour
      };
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error getting user usage stats', { error: err.message, apiKey });
      throw error;
    }
  }

  /**
   * Get service health and performance metrics
   */
  static async getServiceHealth(): Promise<ServiceHealth> {
    // Get system metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // For this implementation, we'll return simulated data
    // In a real implementation, you'd collect actual metrics
    
    return {
      uptime,
      responseTime: 125, // ms average
      errorRate: 0.02,   // 2% error rate
      activeConnections: 42,
      memoryUsage: memoryUsage.heapUsed,
      cpuUsage: 15       // 15% CPU usage (simulated)
    };
  }

  /**
   * Track an API request for analytics
   */
  static trackRequest(apiKey: string, serviceType: string, operation: string, dataSize?: number) {
    // In a real implementation, this would log to an analytics database
    // For this demo, we'll just log to the application logger
    
    logger.info('API Request Tracked', {
      apiKey,
      serviceType,
      operation,
      dataSize,
      timestamp: new Date().toISOString()
    });
    
    // This would typically update usage statistics in real-time
    // using a system like Redis for performance
  }

  /**
   * Get popular services
   */
  static async getPopularServices(): Promise<Array<{ service: string; count: number; percentage: number }>> {
    const stats = await this.getUsageStats();
    const totalRequests = stats.totalRequests;
    
    return Object.entries(stats.requestsByService)
      .map(([service, count]) => ({
        service,
        count,
        percentage: parseFloat(((count / totalRequests) * 100).toFixed(2))
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get growth metrics
   */
  static async getGrowthMetrics(): Promise<any> {
    // In a real implementation, this would calculate growth metrics
    // from historical data
    
    return {
      weeklyGrowth: 12.5,  // 12.5% week-over-week
      monthlyGrowth: 45.2, // 45.2% month-over-month
      dailyActiveUsers: 89,
      weeklyActiveUsers: 245,
      monthlyActiveUsers: 432
    };
  }

  /**
   * Get revenue metrics
   */
  static async getRevenueMetrics(): Promise<any> {
    const stats = await this.getUsageStats();
    
    return {
      totalRevenue: stats.totalRevenue,
      revenuePerUser: parseFloat((stats.totalRevenue / stats.activeUsers).toFixed(2)),
      revenueGrowth: 8.7 // percentage
    };
  }
}