import { UserService } from './UserService';
import { logger } from '../utils/logger';
import { calculateOperationCost } from '../utils/helpers';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface UsageRecord {
  id: string;
  userId: string;
  apiKey: string;
  serviceType: string;
  operation: string;
  cost: number;
  timestamp: Date;
  metadata?: any;
}

export interface BillingRecord {
  id: string;
  userId: string;
  apiKey: string;
  amount: number;
  type: 'debit' | 'credit'; // debit = used, credit = added
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

export class BillingService {
  private static usageRecords: UsageRecord[] = [];
  private static billingRecords: BillingRecord[] = [];

  /**
   * Get usage statistics for an API key
   */
  static async getUsage(apiKey: string): Promise<any> {
    const user = await UserService.findByApiKey(apiKey);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get all usage records for this user
    const userUsage = this.usageRecords.filter(record => record.apiKey === apiKey);
    
    // Calculate totals
    const totalCost = userUsage.reduce((sum, record) => sum + record.cost, 0);
    const totalOperations = userUsage.length;
    
    // Group by service type
    const usageByService: Record<string, { count: number, totalCost: number }> = {};
    userUsage.forEach(record => {
      if (!usageByService[record.serviceType]) {
        usageByService[record.serviceType] = { count: 0, totalCost: 0 };
      }
      usageByService[record.serviceType].count++;
      usageByService[record.serviceType].totalCost += record.cost;
    });

    return {
      userId: user.id,
      apiKey,
      totalOperations,
      totalCost,
      usageByService,
      records: userUsage.map(record => ({
        id: record.id,
        serviceType: record.serviceType,
        operation: record.operation,
        cost: record.cost,
        timestamp: record.timestamp
      }))
    };
  }

  /**
   * Get account balance for an API key
   */
  static async getBalance(apiKey: string): Promise<number> {
    const user = await UserService.findByApiKey(apiKey);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.credits;
  }

  /**
   * Charge an account for API usage
   */
  static async charge(
    apiKey: string,
    amount: number,
    serviceType: string,
    operation: string
  ): Promise<any> {
    const user = await UserService.findByApiKey(apiKey);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate the actual cost based on the operation
    const calculatedCost = calculateOperationCost(operation, { serviceType });
    const chargeAmount = Math.min(amount, calculatedCost); // Use the lesser of manual amount or calculated cost

    // Attempt to deduct credits
    const success = await UserService.deductCredits(user.id!, chargeAmount);
    
    if (!success) {
      throw new BadRequestError(`Insufficient credits. Required: ${chargeAmount}, Available: ${user.credits}`);
    }

    // Record the usage
    const usageRecord: UsageRecord = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id!,
      apiKey,
      serviceType,
      operation,
      cost: chargeAmount,
      timestamp: new Date()
    };
    
    this.usageRecords.push(usageRecord);

    // Record the billing transaction
    const billingRecord: BillingRecord = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id!,
      apiKey,
      amount: chargeAmount,
      type: 'debit',
      description: `API usage charge for ${serviceType}/${operation}`,
      timestamp: new Date(),
      balanceAfter: user.credits // This is the balance after deduction
    };
    
    this.billingRecords.push(billingRecord);

    logger.info('Account charged successfully', { 
      userId: user.id,
      apiKey,
      amount: chargeAmount,
      serviceType,
      operation,
      balance: user.credits
    });

    return {
      success: true,
      chargedAmount: chargeAmount,
      remainingBalance: user.credits,
      description: `Charged for ${serviceType}/${operation}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add credits to an account
   */
  static async addCredits(
    apiKey: string,
    amount: number,
    description: string = 'Credits added'
  ): Promise<any> {
    const user = await UserService.findByApiKey(apiKey);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (amount <= 0) {
      throw new BadRequestError('Amount must be positive');
    }

    // Add credits to user
    const updatedUser = await UserService.updateCredits(user.id!, amount);
    if (!updatedUser) {
      throw new Error('Failed to update user credits');
    }

    // Record the billing transaction
    const billingRecord: BillingRecord = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id!,
      apiKey,
      amount: amount,
      type: 'credit',
      description,
      timestamp: new Date(),
      balanceAfter: updatedUser.credits
    };

    this.billingRecords.push(billingRecord);

    logger.info('Credits added to account', { 
      userId: user.id,
      apiKey,
      amount,
      description,
      newBalance: updatedUser.credits
    });

    return {
      success: true,
      addedAmount: amount,
      newBalance: updatedUser.credits,
      description,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get billing history for a user
   */
  static async getBillingHistory(apiKey: string): Promise<BillingRecord[]> {
    return this.billingRecords
      .filter(record => record.apiKey === apiKey)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all usage records for a user
   */
  static async getUserUsageRecords(apiKey: string): Promise<UsageRecord[]> {
    return this.usageRecords
      .filter(record => record.apiKey === apiKey)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Reset usage statistics (for billing cycle)
   */
  static async resetUsage(apiKey: string): Promise<void> {
    const user = await UserService.findByApiKey(apiKey);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Move current usage records to archive or backup before clearing
    // For this implementation, we'll just log the reset
    logger.info(`Usage records reset for user: ${user.id}`, { apiKey });
    
    // In a real implementation, you might archive the records before clearing
    this.usageRecords = this.usageRecords.filter(record => record.apiKey !== apiKey);
  }
}