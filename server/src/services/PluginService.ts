import { PrivacyServiceRegistry, PrivacyPlugin } from './PrivacyServiceRegistry';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  dependencies?: string[];
  configSchema?: any;
  hooks: PluginHooks;
  updatedAt?: Date;
  tags?: string[];
}

export interface PluginHooks {
  onInit?: () => Promise<void>;
  onBeforeRequest?: (req: any) => Promise<void>;
  onAfterRequest?: (req: any, res: any) => Promise<void>;
  onBeforeResponse?: (res: any) => Promise<void>;
  onAfterResponse?: (res: any) => Promise<void>;
  onShutdown?: () => Promise<void>;
}

export class PluginService {
  private static plugins: Map<string, PluginConfig> = new Map();
  private static pluginInstances: Map<string, any> = new Map();

  /**
   * Register a new plugin
   */
  static async registerPlugin(plugin: PluginConfig): Promise<void> {
    // Validate plugin
    if (!plugin.id || !plugin.name || !plugin.hooks) {
      throw new BadRequestError('Plugin must have id, name, and hooks');
    }

    // Check for dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          logger.warn(`Plugin ${plugin.name} has unmet dependency: ${dep}`);
        }
      }
    }

    // Register the plugin
    this.plugins.set(plugin.id, plugin);
    
    logger.info(`Plugin registered: ${plugin.name}`, {
      id: plugin.id,
      version: plugin.version,
      author: plugin.author,
      dependencies: plugin.dependencies
    });

    // Initialize the plugin if it's enabled
    if (plugin.enabled && plugin.hooks.onInit) {
      try {
        await plugin.hooks.onInit();
        logger.info(`Plugin initialized: ${plugin.name}`);
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`Plugin initialization failed: ${plugin.name}`, { error: err.message });
      }
    }
  }

  /**
   * Activate a plugin
   */
  static async activatePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          logger.error(`Cannot activate plugin ${plugin.name}: missing dependency ${dep}`);
          return false;
        }
        
        const depPlugin = this.plugins.get(dep);
        if (depPlugin && !depPlugin.enabled) {
          logger.error(`Cannot activate plugin ${plugin.name}: dependency ${dep} not enabled`);
          return false;
        }
      }
    }

    plugin.enabled = true;
    plugin.updatedAt = new Date();
    
    // Run initialization hook if available
    if (plugin.hooks.onInit) {
      try {
        await plugin.hooks.onInit();
        logger.info(`Plugin activated: ${plugin.name}`);
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`Plugin activation failed: ${plugin.name}`, { error: err.message });
        return false;
      }
    }
    
    // Update registry
    PrivacyServiceRegistry.enablePlugin(pluginId);
    
    return true;
  }

  /**
   * Deactivate a plugin
   */
  static async deactivatePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    plugin.enabled = false;
    plugin.updatedAt = new Date();
    
    // Run shutdown hook if available
    if (plugin.hooks.onShutdown) {
      try {
        await plugin.hooks.onShutdown();
        logger.info(`Plugin deactivated: ${plugin.name}`);
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`Plugin deactivation failed: ${plugin.name}`, { error: err.message });
      }
    }
    
    // Update registry
    PrivacyServiceRegistry.disablePlugin(pluginId);
    
    return true;
  }

  /**
   * Get a plugin by ID
   */
  static getPlugin(pluginId: string): PluginConfig | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  static getAllPlugins(): PluginConfig[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Execute a plugin hook
   */
  static async executeHook<T = any>(
    hookName: keyof PluginHooks,
    ...args: any[]
  ): Promise<T[]> {
    const results: T[] = [];

    for (const [pluginId, plugin] of this.plugins) {
      if (!plugin.enabled) continue;

      const hook = plugin.hooks[hookName];
      if (hook) {
        try {
          const result = await (hook as any)(...args);
          if (result !== undefined) {
            results.push(result);
          }
        } catch (error: unknown) {
          const err = error as Error;
          logger.error(`Hook ${hookName} failed for plugin ${pluginId}`, { 
            error: err.message,
            pluginId
          });
        }
      }
    }

    return results;
  }

  /**
   * Load plugins from configuration
   */
  static async loadPluginsFromConfig(pluginConfigs: PluginConfig[]): Promise<void> {
    for (const config of pluginConfigs) {
      await this.registerPlugin(config);
    }
  }

  /**
   * Create a plugin instance
   */
  static createPluginInstance(pluginId: string, instance: any): void {
    this.pluginInstances.set(pluginId, instance);
  }

  /**
   * Get a plugin instance
   */
  static getPluginInstance(pluginId: string): any {
    return this.pluginInstances.get(pluginId);
  }

  /**
   * List available plugins
   */
  static listAvailablePlugins(): PrivacyPlugin[] {
    return PrivacyServiceRegistry.getAvailablePlugins();
  }
}

// Default plugins that can be registered
export const defaultPlugins: PluginConfig[] = [
  {
    id: 'rate-limiting',
    name: 'Rate Limiting Plugin',
    version: '1.0.0',
    description: 'Provides rate limiting for API endpoints',
    author: 'Arcium Team',
    enabled: true,
    hooks: {
      onBeforeRequest: async (req: any) => {
        // Implementation would check request rate limits
        logger.info('Rate limiting check performed');
      }
    }
  },
  {
    id: 'audit-logging',
    name: 'Audit Logging Plugin',
    version: '1.0.0',
    description: 'Logs all API requests for audit purposes',
    author: 'Arcium Team',
    enabled: true,
    hooks: {
      onAfterRequest: async (req: any, res: any) => {
        logger.info('Request audited', {
          method: req.method,
          path: req.path,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        });
      }
    }
  },
  {
    id: 'encryption-at-rest',
    name: 'Encryption at Rest Plugin',
    version: '1.0.0',
    description: 'Encrypts data stored in the database',
    author: 'Arcium Team',
    enabled: false,
    dependencies: ['crypto-service'],
    hooks: {
      // Hooks would encrypt/decrypt data during storage/retrieval
    }
  }
];