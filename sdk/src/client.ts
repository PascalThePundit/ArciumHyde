import { PrivacyConfig, APIResponse } from './types';
import { ArciumPrivacyError } from './errors';

/**
 * Client for communicating with the Arcium Privacy API
 */
export class ArciumPrivacyClient {
  private config: PrivacyConfig;
  private baseUrl: string;
  private apiKey: string;
  private fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

  constructor(config: PrivacyConfig, customFetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.arcium-privacy.com/api/v1';
    this.apiKey = config.apiKey;
    this.fetch = customFetch || globalThis.fetch; // Use custom fetch or global fetch
    
    // Validate config
    if (!this.apiKey) {
      throw new ArciumPrivacyError('API key is required');
    }
  }

  /**
   * Makes an HTTP request to the Arcium Privacy API
   * @param endpoint - The API endpoint to call
   * @param options - Request options including method and body
   * @returns The response from the API
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestConfig: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    };

    try {
      const response = await this.fetch(url, requestConfig);

      const data = await response.json();

      if (!response.ok) {
        throw new ArciumPrivacyError(
          `API request failed: ${data.error || response.statusText}`,
          response.status
        );
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }
      
      throw new ArciumPrivacyError(
        `Network error: ${(error as Error).message || 'Unknown error'}` // Type assertion
      );
    }
  }

  /**
   * Gets the account balance
   */
  async getBalance(): Promise<APIResponse<number>> {
    const response = await this.request(`/billing/balance/${this.apiKey}`);
    return {
      success: response.success,
      data: response.data?.balance,
      timestamp: response.timestamp
    };
  }

  /**
   * Gets usage statistics
   */
  async getUsage(): Promise<APIResponse<any>> {
    const response = await this.request(`/billing/usage/${this.apiKey}`);
    return response;
  }

  /**
   * Checks the health of the service
   */
  async healthCheck(): Promise<APIResponse<any>> {
    const response = await this.request('/health');
    return response;
  }

  /**
   * Updates the client configuration
   */
  updateConfig(config: Partial<PrivacyConfig>): void {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.baseUrl) this.baseUrl = `${config.baseUrl}/api/v1`;
    this.config = { ...this.config, ...config };
  }
}
