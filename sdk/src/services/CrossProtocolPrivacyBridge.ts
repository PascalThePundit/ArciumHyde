import { PrivacyInput, PrivacyOutput } from '../types'; // Updated import path
import { logger } from '../utils/logger';

export interface CrossProtocolBridgeConfig {
  sourceProtocol: string;
  targetProtocol: string;
  enabled: boolean;
  mappingRules: Record<string, string>;
}

export interface CrossProtocolOperation {
  id: string;
  name: string;
  description: string;
  sourceProtocol: string;
  targetProtocol: string;
  execute: (input: PrivacyInput) => Promise<PrivacyOutput>;
}

export class CrossProtocolPrivacyBridge {
  private bridges: Map<string, CrossProtocolOperation> = new Map();
  private configs: Map<string, CrossProtocolBridgeConfig> = new Map();
  private enabled: boolean = true;

  /**
   * Register a cross-protocol bridge operation
   */
  registerBridge(bridge: CrossProtocolOperation, config: CrossProtocolBridgeConfig): void {
    this.bridges.set(bridge.id, bridge);
    this.configs.set(bridge.id, config);
    
    logger.info('Cross-protocol bridge registered', {
      id: bridge.id,
      sourceProtocol: config.sourceProtocol,
      targetProtocol: config.targetProtocol
    });
  }

  /**
   * Execute a cross-protocol operation
   */
  async executeBridge(bridgeId: string, input: PrivacyInput): Promise<PrivacyOutput> {
    const bridge = this.bridges.get(bridgeId);
    const config = this.configs.get(bridgeId);

    if (!bridge) {
      throw new Error(`Bridge not found: ${bridgeId}`);
    }

    if (!config || !config.enabled) {
      throw new Error(`Bridge is not enabled: ${bridgeId}`);
    }

    if (!this.enabled) {
      throw new Error('Cross-protocol privacy bridge is disabled');
    }

    logger.debug('Executing cross-protocol bridge', {
      id: bridgeId,
      sourceProtocol: config.sourceProtocol,
      targetProtocol: config.targetProtocol
    });

    return bridge.execute(input);
  }

  /**
   * Get available bridges between protocols
   */
  getBridgesBetweenProtocols(source: string, target: string): CrossProtocolOperation[] {
    return Array.from(this.bridges.values()).filter(bridge => {
      const config = this.configs.get(bridge.id);
      return config && 
             config.sourceProtocol === source && 
             config.targetProtocol === target &&
             config.enabled;
    });
  }

  /**
   * Get all registered bridges
   */
  getAllBridges(): CrossProtocolOperation[] {
    return Array.from(this.bridges.values());
  }

  /**
   * Enable/disable the entire bridge system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    logger.info('Cross-protocol privacy bridge system', { enabled });
  }

  /**
   * Check if bridge system is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get bridge configuration
   */
  getBridgeConfig(bridgeId: string): CrossProtocolBridgeConfig | undefined {
    return this.configs.get(bridgeId);
  }

  /**
   * Update bridge configuration
   */
  updateBridgeConfig(bridgeId: string, config: Partial<CrossProtocolBridgeConfig>): boolean {
    const existingConfig = this.configs.get(bridgeId);
    if (!existingConfig) {
      return false;
    }

    Object.assign(existingConfig, config);
    this.configs.set(bridgeId, existingConfig);
    return true;
  }
}
