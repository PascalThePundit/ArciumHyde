// TypeScript types for Arcium Privacy-as-a-Service SDK

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface EncryptionRequest {
  data: string | Buffer;
  method?: string;
  publicKey?: string;
  password?: string;
}

export interface EncryptionResponse {
  encryptedData: {
    data: string;
    salt?: string;
    iv?: string;
    method: string;
    [key: string]: any;
  };
  method: string;
  timestamp: string;
}

export interface DecryptionRequest {
  encryptedData: any;
  method?: string;
  privateKey?: string;
  password?: string;
}

export interface KeyDerivationRequest {
  input: string;
  method?: string;
  salt?: string;
  iterations?: number;
}

export interface ZkProofRequest {
  circuitName: string;
  inputs: Record<string, any>;
}

export interface ZkProofResponse {
  proof: any;
  publicSignals: string[];
  circuitName: string;
  inputs: string[];
  timestamp: string;
}

export interface RangeProofRequest {
  value: number;
  min: number;
  max: number;
}

export interface BalanceProofRequest {
  balance: number;
  threshold: number;
}

export interface ClaimRequest {
  type: string;
  issuer: string;
  subject: string;
  attributes: Record<string, any>;
  disclosurePolicy?: any;
  expirationDate?: number;
}

export interface ClaimResponse {
  claim: {
    id: string;
    type: string;
    issuer: string;
    subject: string;
    issuanceDate: number;
    expirationDate?: number;
    attributes: Record<string, any>;
    proof: string;
    disclosurePolicy: any;
  };
  timestamp: string;
}

export interface DisclosureRequest {
  verifier: string;
  requestedClaims: Array<{
    type: string;
    requiredAttributes: string[];
    conditions?: Record<string, any>;
  }>;
  justification: string;
  expiresInSeconds?: number;
}

export interface DisclosureResponse {
  requestId: string;
  holder: string;
  disclosedClaims: Array<{
    claimId: string;
    type: string;
    disclosedAttributes: Record<string, any>;
    proof: string;
    timestamp: number;
  }>;
  signature: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface ServiceRegistryResponse {
  services: Array<{
    id: string;
    name: string;
    description: string;
    endpoint: string;
    authRequired: boolean;
    tags: string[];
    schema: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
  count: number;
  timestamp: string;
}

export interface BillingUsageResponse {
  userId: string;
  apiKey: string;
  totalOperations: number;
  totalCost: number;
  usageByService: Record<string, { count: number, totalCost: number }>;
  records: Array<{
    id: string;
    serviceType: string;
    operation: string;
    cost: number;
    timestamp: Date;
  }>;
  timestamp: string;
}

export interface BillingBalanceResponse {
  balance: number;
  apiKey: string;
  timestamp: string;
}

export interface BillingChargeRequest {
  amount: number;
  serviceType: string;
  operation: string;
}

export interface BillingChargeResponse {
  success: boolean;
  chargedAmount: number;
  remainingBalance: number;
  description: string;
  timestamp: string;
}

export interface UserRegistrationRequest {
  email: string;
  name: string;
  organization?: string;
  useCase?: string;
}

export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    organization?: string;
    useCase?: string;
    apiKey: string;
    credits: number;
  };
}

export interface UserLoginRequest {
  apiKey: string;
}

export interface UserLoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    organization?: string;
    useCase?: string;
    apiKey: string;
    credits: number;
  };
}

export interface AnalyticsUsageResponse {
  totalOperations: number;
  operationsByService: Record<string, number>;
  totalCost: number;
  lastActive: Date;
  requestsByHour: Record<string, number>;
}

export interface ArciumSDKConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}