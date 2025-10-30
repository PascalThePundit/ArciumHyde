/**
 * Custom error class for Arcium Privacy SDK
 */
export class ArciumPrivacyError extends Error {
  public statusCode?: number;
  public code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'ArciumPrivacyError';
    this.statusCode = statusCode;
    this.code = code || 'SDK_ERROR';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ArciumPrivacyError);
    }
  }

  /**
   * Creates a helpful error message for common issues
   */
  static createHelpfulMessage(errorCode: string, context?: any): string {
    switch (errorCode) {
      case 'INVALID_API_KEY':
        return `Invalid API key provided. Please check your API key and ensure it's correctly configured. 
                You can generate a new API key at https://dashboard.arcium-privacy.com.`;
      
      case 'INSUFFICIENT_CREDITS':
        return `Insufficient credits for this operation. Current operation requires more credits than available. 
                Please add more credits to your account at https://dashboard.arcium-privacy.com/billing.`;
      
      case 'INVALID_PROOF_INPUTS':
        return `Invalid inputs provided for proof generation. Please ensure all required parameters are provided 
                and within valid ranges. For range proofs, ensure min <= value <= max.`;
      
      case 'PROOF_VERIFICATION_FAILED':
        return `Proof verification failed. This could be due to invalid proof data or mismatched parameters. 
                Please check that the proof was generated correctly.`;
      
      case 'ENCRYPTION_FAILED':
        return `Encryption failed. Please ensure the data and password are properly formatted and within 
                acceptable length limits. For large data, consider encrypting in chunks.`;
      
      case 'DECRYPTION_FAILED':
        return `Decryption failed. This could be due to incorrect password, corrupt encrypted data, 
                or unsupported encryption format. Ensure the data was encrypted with the same password.`;
      
      case 'NETWORK_ERROR':
        return `Network error occurred. Please check your internet connection and ensure the Arcium Privacy API 
                is accessible. If using a proxy, verify your proxy configuration.`;
      
      case 'RATE_LIMIT_EXCEEDED':
        return `Rate limit exceeded. You've made too many requests in a short time period. 
                Please wait before making more requests, or consider upgrading your account for higher limits.`;
      
      default:
        return `${context || 'An error occurred'}: ${errorCode}. 
                Please check the parameters and try again. If the issue persists, contact support@arcium-privacy.com 
                with the error details for assistance.`;
    }
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class InvalidConfigError extends ArciumPrivacyError {
  constructor(message: string) {
    super(message, undefined, 'INVALID_CONFIG');
    this.name = 'InvalidConfigError';
  }
}

/**
 * Error thrown when API credentials are invalid
 */
export class AuthenticationError extends ArciumPrivacyError {
  constructor(message: string = 'Authentication failed - check your API key') {
    super(message, 401, 'AUTHENTICATION_FAILED');
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a resource is not found
 */
export class ResourceNotFoundError extends ArciumPrivacyError {
  constructor(message: string = 'Requested resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND');
    this.name = 'ResourceNotFoundError';
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends ArciumPrivacyError {
  constructor(message: string = 'Rate limit exceeded - please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when inputs are invalid
 */
export class ValidationError extends ArciumPrivacyError {
  constructor(message: string) {
    super(message, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}