import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  // Generate a UUID and add a prefix for identification
  return `arc_${uuidv4().replace(/-/g, '')}`;
}

/**
 * Hash a password or API key for storage
 */
export async function hashPassword(password: string): Promise<string> {
  // In a real implementation, we would use bcrypt or similar
  // For this example, we'll use a simple approach
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a password or API key against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Calculate cost for an API operation
 */
export function calculateOperationCost(operationType: string, params?: any): number {
  // Define base costs for different operations
  const baseCosts: Record<string, number> = {
    'encrypt': 1,
    'decrypt': 1,
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

  const baseCost = baseCosts[operationType] || 1;
  
  // Adjust cost based on parameters (e.g., data size)
  if (params && params.dataSize) {
    // Increase cost based on data size (in MB)
    const dataSizeInMB = Math.ceil(params.dataSize / (1024 * 1024));
    return baseCost + Math.ceil(dataSizeInMB * 0.1); // Additional cost per MB
  }
  
  return baseCost;
}

/**
 * Validate an API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  // Check for the expected format: arc_[32_hex_characters]
  const apiKeyRegex = /^arc_[a-f0-9]{32}$/;
  return apiKeyRegex.test(apiKey);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}