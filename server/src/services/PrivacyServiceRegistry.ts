import { logger } from '../utils/logger';

export interface PrivacyService {
  id?: string;
  name: string;
  description: string;
  endpoint: string;
  authRequired: boolean;
  tags: string[];
  schema: any; // JSON schema for the service
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivacyPlugin {
  id?: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  config: any;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export class PrivacyServiceRegistry {
  private static services: Map<string, PrivacyService> = new Map();
  private static plugins: Map<string, PrivacyPlugin> = new Map();

  /**
   * Initialize the registry with default services
   */
  static initialize() {
    // Add default services
    this.registerService({
      name: 'zk-proof-service',
      description: 'Zero-knowledge proof generation and verification',
      endpoint: '/api/v1/zk-proof',
      authRequired: true,
      tags: ['zkp', 'privacy', 'crypto'],
      schema: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.registerService({
      name: 'encryption-service',
      description: 'Encryption and decryption operations',
      endpoint: '/api/v1/encrypt',
      authRequired: true,
      tags: ['encryption', 'crypto'],
      schema: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.registerService({
      name: 'selective-disclosure-service',
      description: 'Selective disclosure and verifiable claims',
      endpoint: '/api/v1/selective-disclosure',
      authRequired: true,
      tags: ['identity', 'verifiable-claims'],
      schema: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info('Privacy service registry initialized with default services');
  }

  /**
   * Register a new privacy service
   */
  static registerService(service: Omit<PrivacyService, 'id'>): PrivacyService {
    const id = service.name.toLowerCase().replace(/\s+/g, '-');
    const fullService: PrivacyService = {
      ...service,
      id
    };

    this.services.set(id, fullService);
    logger.info(`Privacy service registered: ${id}`, { 
      name: service.name, 
      endpoint: service.endpoint,
      tags: service.tags
    });

    return fullService;
  }

  /**
   * Get a service by ID
   */
  static getService(id: string): PrivacyService | undefined {
    return this.services.get(id);
  }

  /**
   * Get all available services
   */
  static getAvailableServices(): PrivacyService[] {
    return Array.from(this.services.values());
  }

  /**
   * Unregister a service
   */
  static unregisterService(id: string): boolean {
    const exists = this.services.has(id);
    if (exists) {
      this.services.delete(id);
      logger.info(`Privacy service unregistered: ${id}`);
    }
    return exists;
  }

  /**
   * Register a new privacy plugin
   */
  static registerPlugin(plugin: Omit<PrivacyPlugin, 'id'>): PrivacyPlugin {
    const id = plugin.name.toLowerCase().replace(/\s+/g, '-');
    const fullPlugin: PrivacyPlugin = {
      ...plugin,
      id
    };

    this.plugins.set(id, fullPlugin);
    logger.info(`Privacy plugin registered: ${id}`, { 
      name: plugin.name, 
      version: plugin.version,
      author: plugin.author
    });

    return fullPlugin;
  }

  /**
   * Get a plugin by ID
   */
  static getPlugin(id: string): PrivacyPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all available plugins
   */
  static getAvailablePlugins(): PrivacyPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Enable a plugin
   */
  static enablePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = true;
      plugin.updatedAt = new Date();
      logger.info(`Privacy plugin enabled: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Disable a plugin
   */
  static disablePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = false;
      plugin.updatedAt = new Date();
      logger.info(`Privacy plugin disabled: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Get services by tag
   */
  static getServicesByTag(tag: string): PrivacyService[] {
    return Array.from(this.services.values()).filter(service => 
      service.tags.includes(tag)
    );
  }

  /**
   * Get plugins by tag
   */
  static getPluginsByTag(tag: string): PrivacyPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => 
      plugin.tags?.includes(tag)
    );
  }

  /**
   * Search services by name or description
   */
  static searchServices(query: string): PrivacyService[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.services.values()).filter(service => 
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Search plugins by name or description
   */
  static searchPlugins(query: string): PrivacyPlugin[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(plugin => 
      plugin.name.toLowerCase().includes(lowerQuery) ||
      plugin.description.toLowerCase().includes(lowerQuery)
    );
  }
}