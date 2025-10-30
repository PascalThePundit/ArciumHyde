import { 
  ArciumSDKConfig, 
  APIResponse
} from './types';

export interface ServiceRegistrationRequest {
  name: string;
  description: string;
  endpoint: string;
  authRequired?: boolean;
  tags?: string[];
  schema?: any;
}

export interface ServiceRegistrationResponse {
  success: boolean;
  service: {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    authRequired: boolean;
    tags: string[];
    schema: any;
    createdAt: Date;
    updatedAt: Date;
  };
  message: string;
  timestamp: string;
}

export interface PluginRegistrationRequest {
  name: string;
  description: string;
  version: string;
  author: string;
  enabled?: boolean;
  config?: any;
}

export class PrivacyServiceRegistryAPI {
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
   * Get list of available privacy services
   */
  async listServices(): Promise<APIResponse<any>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/registry/services`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      }
    });

    const result = await response.json();
    return result;
  }

  /**
   * Get list of available privacy plugins
   */
  async listPlugins(): Promise<APIResponse<any>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/registry/plugins`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.config.apiKey,
      }
    });

    const result = await response.json();
    return result;
  }

  /**
   * Register a new privacy service
   */
  async registerService(request: ServiceRegistrationRequest): Promise<APIResponse<ServiceRegistrationResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/registry/register-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        name: request.name,
        description: request.description,
        endpoint: request.endpoint,
        authRequired: request.authRequired !== undefined ? request.authRequired : true,
        tags: request.tags || [],
        schema: request.schema || {}
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Search for services by tag
   */
  async findServicesByTag(tag: string): Promise<APIResponse<any>> {
    const servicesResponse = await this.listServices();
    if (!servicesResponse.success || !servicesResponse.data) {
      return {
        success: false,
        error: servicesResponse.error || 'Failed to fetch services',
        timestamp: new Date().toISOString()
      };
    }

    const filteredServices = servicesResponse.data.services.filter((service: any) => 
      service.tags.includes(tag)
    );

    return {
      success: true,
      data: {
        services: filteredServices,
        count: filteredServices.length,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Find services by name or description
   */
  async searchServices(query: string): Promise<APIResponse<any>> {
    const servicesResponse = await this.listServices();
    if (!servicesResponse.success || !servicesResponse.data) {
      return {
        success: false,
        error: servicesResponse.error || 'Failed to fetch services',
        timestamp: new Date().toISOString()
      };
    }

    const lowerQuery = query.toLowerCase();
    const filteredServices = servicesResponse.data.services.filter((service: any) => 
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
    );

    return {
      success: true,
      data: {
        services: filteredServices,
        count: filteredServices.length,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<APIResponse<any>> {
    const servicesResponse = await this.listServices();
    if (!servicesResponse.success || !servicesResponse.data) {
      return {
        success: false,
        error: servicesResponse.error || 'Failed to fetch services',
        timestamp: new Date().toISOString()
      };
    }

    const service = servicesResponse.data.services.find((s: any) => s.id === id);
    if (!service) {
      return {
        success: false,
        error: 'Service not found',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: service,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get ZK proof service details
   */
  async getZkProofService(): Promise<APIResponse<any>> {
    return this.getServiceById('zk-proof-service');
  }

  /**
   * Get encryption service details
   */
  async getEncryptionService(): Promise<APIResponse<any>> {
    return this.getServiceById('encryption-service');
  }

  /**
   * Get selective disclosure service details
   */
  async getSelectiveDisclosureService(): Promise<APIResponse<any>> {
    return this.getServiceById('selective-disclosure-service');
  }
}