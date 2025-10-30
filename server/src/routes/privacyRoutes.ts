import { Router } from 'express';
import { PrivacyController } from '../controllers/PrivacyController';

const router = Router();
const privacyController = new PrivacyController();

// Initialize privacy services
router.post('/initialize', privacyController.initialize.bind(privacyController));

// MPC operations
router.post('/mpc', privacyController.performMPC.bind(privacyController));

// FHE operations  
router.post('/fhe', privacyController.performFHE.bind(privacyController));

// TEE operations
router.post('/tee', privacyController.performTEE.bind(privacyController));

// Private storage operations
router.post('/store-private', privacyController.storePrivate.bind(privacyController));
router.get('/retrieve-private/:key', privacyController.retrievePrivate.bind(privacyController));

// Comprehensive privacy operations
router.post('/execute', privacyController.executePrivacyOperation.bind(privacyController));

// Health check
router.get('/health', privacyController.getHealth.bind(privacyController));

export default router;