import { PrivacyServiceRegistry } from './PrivacyServiceRegistry';
import { SolanaIntegration } from './SolanaIntegrationService';
import { MPCService } from './MPCService';
import { FHEService } from './FHEService';
import { TEEIntegrationService } from './TEEIntegrationService';
import { ComprehensivePrivacyService } from './ComprehensivePrivacyService';
import { AnalyticsService } from './AnalyticsService';
import { BillingService } from './BillingService';
import { EncryptionService } from './EncryptionService';
import { PluginService } from './PluginService';
import { SelectiveDisclosureService } from './SelectiveDisclosureService';
import { UserService } from './UserService';
import { ZkProofService } from './ZkProofService';
import { logger } from '../utils/logger';

export const initializeServices = (): void => {
  logger.info('Initializing privacy services...');
  
  // Initialize the privacy service registry
  PrivacyServiceRegistry.initialize();
  
  logger.info('All privacy services initialized successfully');
};

// Export all services
export {
  PrivacyServiceRegistry,
  SolanaIntegration,
  MPCService,
  FHEService,
  TEEIntegrationService,
  ComprehensivePrivacyService,
  AnalyticsService,
  BillingService,
  EncryptionService,
  PluginService,
  SelectiveDisclosureService,
  UserService,
  ZkProofService
};