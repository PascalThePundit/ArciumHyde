import { 
  ArciumSDKConfig, 
  EncryptionRequest, 
  DecryptionRequest, 
  KeyDerivationRequest,
  APIResponse,
  EncryptionResponse
} from './types';

export class EncryptionAPI {
  private config: ArciumSDKConfig;

  constructor(config: ArciumSDKConfig) {
    this.config = config;
  }

  /**
   * Updates the configuration for this API instance
   */
  updateConfig(newConfig: ArciumSDKConfig): void {
    this.config = newConfig;
  }

  /**
   * Encrypt data using the specified method
   */
  async encrypt(request: EncryptionRequest): Promise<APIResponse<EncryptionResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/encrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        data: request.data,
        method: request.method || 'aes256',
        publicKey: request.publicKey,
        password: request.password
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Decrypt data using the specified method
   */
  async decrypt(encryptedData: any, method: string = 'aes256', privateKey?: string, password?: string): Promise<APIResponse<string>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/decrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        encryptedData,
        method,
        privateKey,
        password
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Derive a cryptographic key from a password or other input
   */
  async deriveKey(input: string, method: string = 'pbkdf2', salt?: string, iterations: number = 100000): Promise<APIResponse<string>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/derive-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        input,
        method,
        salt,
        iterations
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Encrypt text data
   */
  async encryptText(text: string, password: string): Promise<APIResponse<EncryptionResponse>> {
    return this.encrypt({
      data: text,
      method: 'aes256',
      password
    });
  }

  /**
   * Encrypt file data
   */
  async encryptFile(fileData: Buffer, password: string): Promise<APIResponse<EncryptionResponse>> {
    return this.encrypt({
      data: fileData,
      method: 'aes256',
      password
    });
  }

  /**
   * Helper method to encrypt and return just the encrypted data string
   */
  async encryptSimple(data: string, password: string): Promise<string> {
    const response = await this.encryptText(data, password);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Encryption failed');
    }
    return response.data.encryptedData.data;
  }
}