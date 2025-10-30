// Arcium Privacy-as-a-Service SDK for External Developers
// This SDK provides easy access to Arcium's privacy infrastructure

import { EncryptionAPI } from './EncryptionAPI';
import { ZkProofAPI } from './ZkProofAPI';
import { SelectiveDisclosureAPI } from './SelectiveDisclosureAPI';
import { PrivacyServiceRegistryAPI } from './PrivacyServiceRegistryAPI';
import { BillingAPI } from './BillingAPI';

export interface ArciumSDKConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class ArciumSDK {
  public encryption: EncryptionAPI;
  public zkProof: ZkProofAPI;
  public selectiveDisclosure: SelectiveDisclosureAPI;
  public serviceRegistry: PrivacyServiceRegistryAPI;
  public billing: BillingAPI;

  private config: ArciumSDKConfig;

  constructor(config: ArciumSDKConfig) {
    this.config = {
      baseUrl: 'https://api.arcium-privacy.com',
      timeout: 30000, // 30 seconds
      ...config
    };

    // Initialize API clients
    this.encryption = new EncryptionAPI(this.config);
    this.zkProof = new ZkProofAPI(this.config);
    this.selectiveDisclosure = new SelectiveDisclosureAPI(this.config);
    this.serviceRegistry = new PrivacyServiceRegistryAPI(this.config);
    this.billing = new BillingAPI(this.config);
  }

  /**
   * Get API version
   */
  getVersion(): string {
    return '1.0.0';
  }

  /**
   * Get API configuration
   */
  getConfig(): ArciumSDKConfig {
    return { ...this.config };
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig: Partial<ArciumSDKConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update all API clients with new config
    this.encryption.updateConfig(this.config);
    this.zkProof.updateConfig(this.config);
    this.selectiveDisclosure.updateConfig(this.config);
    this.serviceRegistry.updateConfig(this.config);
    this.billing.updateConfig(this.config);
  }

  /**
   * Ping the API to check connectivity
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Ping failed:', error);
      return false;
    }
  }
}

// Export the main SDK class
export default ArciumSDK;

// Export types for TypeScript users
export * from './types';