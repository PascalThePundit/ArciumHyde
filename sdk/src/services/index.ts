// Export all compossability framework components
export { PrimitiveRegistry } from './PrimitiveRegistry';
export { ComposabilityEngine } from './ComposabilityEngine';
export { PluginManager } from './PluginManager';
export { CrossProtocolPrivacyBridge } from './CrossProtocolPrivacyBridge';
export { PrimitiveFactory } from './PrimitiveFactory';

// Export types
export * from '../types'; // Updated export path

// Export primitive implementations
export * from '../primitives/EncryptionPrimitives';
export * from '../primitives/ZkProofPrimitives';
