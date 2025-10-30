import { Router } from 'express';
import { EncryptionController } from '../../controllers/EncryptionController';
import { ZkProofController } from '../../controllers/ZkProofController';
import { SelectiveDisclosureController } from '../../controllers/SelectiveDisclosureController';
import { PrivacyServiceRegistryController } from '../../controllers/PrivacyServiceRegistryController';
import { BillingController } from '../../controllers/BillingController';
import { AuthenticationController } from '../../controllers/AuthenticationController';
import { AnalyticsController } from '../../controllers/AnalyticsController';
import privacyRoutes from '../../routes/privacyRoutes';

const router = Router();

// Authentication routes
router.post('/auth/register', AuthenticationController.register);
router.post('/auth/login', AuthenticationController.login);
router.post('/auth/verify-token', AuthenticationController.verifyToken);

// Encryption/Decryption routes
router.post('/encrypt', EncryptionController.encrypt);
router.post('/decrypt', EncryptionController.decrypt);
router.post('/derive-key', EncryptionController.deriveKey);

// Zero-Knowledge Proof routes
router.post('/zk-proof/generate', ZkProofController.generateProof);
router.post('/zk-proof/verify', ZkProofController.verifyProof);
router.post('/zk-proof/generate-range-proof', ZkProofController.generateRangeProof);
router.post('/zk-proof/generate-balance-proof', ZkProofController.generateBalanceGreaterThanProof);

// Selective Disclosure routes
router.post('/selective-disclosure/issue-claim', SelectiveDisclosureController.issueClaim);
router.post('/selective-disclosure/create-request', SelectiveDisclosureController.createDisclosureRequest);
router.post('/selective-disclosure/respond', SelectiveDisclosureController.respondToRequest);
router.post('/selective-disclosure/verify', SelectiveDisclosureController.verifyDisclosure);

// Privacy Service Registry routes
router.get('/registry/services', PrivacyServiceRegistryController.listServices);
router.get('/registry/plugins', PrivacyServiceRegistryController.listPlugins);
router.post('/registry/register-service', PrivacyServiceRegistryController.registerService);

// Billing routes
router.get('/billing/usage/:apiKey', BillingController.getUsage);
router.get('/billing/balance/:apiKey', BillingController.getBalance);
router.post('/billing/charge/:apiKey', BillingController.charge);

// Analytics routes
router.get('/analytics/usage', AnalyticsController.getUsageStats);
router.get('/analytics/usage/:apiKey', AnalyticsController.getUserUsage);
router.get('/analytics/health', AnalyticsController.getServiceHealth);

// Privacy routes (MPC, FHE, TEE, etc.)
router.use('/privacy', privacyRoutes);

export { router };