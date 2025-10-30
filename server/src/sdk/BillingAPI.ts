import { 
  ArciumSDKConfig, 
  APIResponse,
  BillingUsageResponse,
  BillingBalanceResponse,
  BillingChargeRequest,
  BillingChargeResponse
} from './types';

export class BillingAPI {
  private config: ArciumSDKConfig;

  constructor(config: ArciumSDKConfig) {
    this.config = config;
  }

  /**
   * Updates the configuration for this API instance
   */
  updateConfig(newConfig: ArciumSDKConfig): void {
    this.config = newConfig;
  }

  /**
   * Get usage statistics for the current API key
   */
  async getUsage(): Promise<APIResponse<BillingUsageResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/billing/usage/${this.config.apiKey}`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      }
    });

    const result = await response.json();
    return result;
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<APIResponse<BillingBalanceResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/billing/balance/${this.config.apiKey}`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      }
    });

    const result = await response.json();
    return result;
  }

  /**
   * Charge the account for a specific operation
   */
  async charge(request: BillingChargeRequest): Promise<APIResponse<BillingChargeResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/billing/charge/${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(request)
    });

    const result = await response.json();
    return result;
  }

  /**
   * Get analytics for the current user
   */
  async getAnalytics(): Promise<APIResponse<any>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/analytics/usage/${this.config.apiKey}`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      }
    });

    const result = await response.json();
    return result;
  }

  /**
   * Get billing history
   */
  async getBillingHistory(): Promise<APIResponse<any>> {
    // This would be implemented in the server API
    // For now, we'll just return an error since it's not implemented yet
    return {
      success: false,
      error: 'Billing history endpoint not yet implemented',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add credits to the account (for testing purposes)
   */
  async addCredits(amount: number, description: string = 'Credits added'): Promise<APIResponse<any>> {
    // This would typically require special admin privileges
    // For testing purposes, we'll return a mock response
    return {
      success: false,
      error: 'Adding credits requires admin privileges',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if the account has sufficient credits for an operation
   */
  async hasSufficientCredits(cost: number): Promise<boolean> {
    try {
      const balanceResponse = await this.getBalance();
      if (!balanceResponse.success || !balanceResponse.data) {
        return false;
      }
      
      return balanceResponse.data.balance >= cost;
    } catch (error) {
      console.error('Error checking credits:', error);
      return false;
    }
  }

  /**
   * Estimate the cost of an operation
   */
  async estimateCost(serviceType: string, operation: string, params?: any): Promise<number> {
    // In a real implementation, this would call an estimation endpoint
    // For now, we'll return a mock cost based on service type
    
    const baseCosts: Record<string, number> = {
      'encryption': 1,
      'decryption': 1,
      'derive_key': 1,
      'zk_proof_generate': 5,
      'zk_proof_verify': 3,
      'zk_proof_range': 4,
      'zk_proof_balance': 4,
      'selective_disclosure_issue': 3,
      'selective_disclosure_request': 2,
      'selective_disclosure_respond': 3,
      'selective_disclosure_verify': 3
    };

    const baseCost = baseCosts[`${serviceType.replace('-', '_')}_${operation}`] || 1;
    
    // Adjust cost based on parameters (e.g., data size)
    if (params && params.dataSize) {
      // Increase cost based on data size
      const dataSizeInMB = Math.ceil(params.dataSize / (1024 * 1024));
      return baseCost + Math.ceil(dataSizeInMB * 0.1); // Additional cost per MB
    }
    
    return baseCost;
  }
}