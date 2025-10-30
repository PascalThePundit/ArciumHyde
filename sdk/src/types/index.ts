export interface PrivacyConfig {
  apiKey: string;
  baseUrl: string;
  // Add other relevant config properties
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string; // Added timestamp property
}

export interface EncryptOptions {
  data: string;
  key: string;
  method?: string; // Added method property
  // Add other encryption options
}

export interface DecryptOptions {
  encryptedData: string;
  key: string;
  method?: string; // Added method property
  // Add other decryption options
}

export interface EncryptionResult {
  encryptedData: string;
  metadata?: Record<string, any>;
}

export interface Claim {
  id: string;
  issuer: string;
  subject: string;
  attributes: Record<string, any>;
  disclosurePolicy?: any; // Define more specifically if known
  expirationDate?: number;
}

export interface DisclosureRequest {
  claims: Claim[];
  verifier: string; // Added verifier property
  // Add other request properties
}

export interface DisclosureResponse {
  disclosedClaims: Claim[];
  proof: string;
  // Add other response properties
}

export interface ZkProof {
  proof: string;
  publicInputs: Record<string, any>;
  publicSignals?: Record<string, any>; // Added publicSignals property
  circuitName?: string; // Added circuitName property
  inputs?: Record<string, any>; // Added inputs property
  // Add other ZK proof properties
}

export interface Operation {
  id: string;
  // Add other operation properties
}

// New types for ComposabilityEngine
export interface PrivacyInput extends Record<string, any> {}
export interface PrivacyOutput extends Record<string, any> {}

export interface PrivacyOperation {
  id: string; // Added id property
  name: string;
  description: string;
  execute: (input: PrivacyInput) => Promise<PrivacyOutput>;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

export interface PrivacyWorkflow {
  id: string;
  name: string;
  description: string;
  operations: PrivacyOperation[];
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

// New type for PluginManager
export interface PrivacyPrimitive {
  id: string;
  name: string;
  description: string;
  execute: (input: PrivacyInput) => Promise<PrivacyOutput>;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  // Added properties based on error messages
  category: string; // Made required
  version: string; // Made required
  tags: string[]; // Made required
  author: string; // Made required
  dependencies: string[]; // Made required
}

export interface RangeProofParams {
  value: number;
  min: number;
  max: number;
}

export interface BalanceProofParams {
  balance: number;
  threshold: number;
}

export interface CustomProofParams {
  circuitName: string;
  inputs: Record<string, any>;
}