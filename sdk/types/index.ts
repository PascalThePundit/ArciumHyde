/**
 * Configuration options for the Arcium Privacy SDK
 */
export interface ArciumSDKConfig {
  /** The API key for authenticating with the Arcium Privacy service */
  apiKey: string;
  /** The base URL for the Arcium Privacy API (defaults to production) */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 30000ms) */
  timeout?: number;
  /** Whether to enable debug logging (defaults to false) */
  debug?: boolean;
}

/**
 * Response structure for all API calls
 */
export interface APIResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** The response data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Timestamp of the response */
  timestamp: string;
}

/**
 * Structure for encryption parameters
 */
export interface EncryptOptions {
  /** Encryption method (defaults to 'aes256') */
  method?: 'aes256' | 'rsa' | 'secp256k1';
  /** Encryption key (for asymmetric encryption) */
  key?: string;
}

/**
 * Structure for decryption parameters
 */
export interface DecryptOptions {
  /** Decryption method (defaults to 'aes256') */
  method?: 'aes256' | 'rsa' | 'secp256k1';
  /** Decryption key (for asymmetric encryption) */
  key?: string;
}

/**
 * Structure for zero-knowledge proof
 */
export interface ZkProof {
  /** The proof object */
  proof: any;
  /** Public signals associated with the proof */
  publicSignals: string[];
  /** The name of the circuit used */
  circuitName: string;
  /** The inputs used to generate the proof */
  inputs: string[];
}

/**
 * Structure for a verifiable claim
 */
export interface Claim {
  /** Unique identifier for the claim */
  id: string;
  /** Type of the claim (e.g., 'age_verification', 'credit_score') */
  type: string;
  /** The issuer of the claim */
  issuer: string;
  /** The subject of the claim */
  subject: string;
  /** When the claim was issued */
  issuanceDate: number;
  /** When the claim expires (optional) */
  expirationDate?: number;
  /** Attributes contained in the claim */
  attributes: Record<string, any>;
  /** Zero-knowledge proof for the claim */
  proof: string; // JSON string of the proof
  /** Disclosure policy for the claim */
  disclosurePolicy: {
    public: string[];
    conditional: Array<{
      attribute: string;
      condition: string; // e.g., "age >= 18"
      requiredBy: string[]; // list of verifiers that can access
    }>;
    private: string[];
  };
}

/**
 * Structure for a disclosure request
 */
export interface DisclosureRequest {
  /** Unique identifier for the request */
  id: string;
  /** The verifier requesting the disclosure */
  verifier: string;
  /** Claims requested in the disclosure */
  requestedClaims: Array<{
    type: string;
    requiredAttributes: string[];
    conditions?: Record<string, any>;
  }>;
  /** Reason for the request */
  justification: string;
  /** When the request was made */
  requestedAt: number;
  /** When the request expires */
  expiresAt: number;
}

/**
 * Structure for a disclosure response
 */
export interface DisclosureResponse {
  /** The ID of the original request */
  requestId: string;
  /** The holder who responded */
  holder: string;
  /** Claims disclosed in the response */
  disclosedClaims: Array<{
    claimId: string;
    type: string;
    disclosedAttributes: Record<string, any>;
    proof: string;
    timestamp: number;
  }>;
  /** Signature of the response */
  signature: string;
  /** Status of the response */
  status: 'verified' | 'pending' | 'rejected';
}

/**
 * Structure for usage statistics
 */
export interface UsageStats {
  /** Total number of operations performed */
  totalOperations: number;
  /** Operations broken down by service type */
  operationsByService: Record<string, number>;
  /** Total cost in credits */
  totalCost: number;
  /** When the account was last active */
  lastActive: Date;
  /** Request distribution by hour */
  requestsByHour: Record<string, number>;
}

/**
 * Structure for encryption result
 */
export interface EncryptionResult {
  /** The encrypted data */
  encryptedData: {
    data: string;
    salt?: string;
    iv?: string;
    method: string;
    [key: string]: any;
  };
  /** The encryption method used */
  method: string;
  /** When the operation was performed */
  timestamp: string;
}

/**
 * Structure for proof generation options
 */
export interface ProofOptions {
  /** Type of proof to generate */
  type: 'range' | 'balance' | 'custom';
  /** Parameters for the proof */
  params: any;
}