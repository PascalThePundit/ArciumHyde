import { PrivacyPrimitive } from '../types';
import { PrimitiveRegistry } from './PrimitiveRegistry';
import { logger } from '../utils/logger';

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: string;
  dependencies: string[];
  updatedAt?: Date;
  tags?: string[];
}

export interface PrivacyPlugin {
  metadata: PluginMetadata;
  init: (registry: PrimitiveRegistry) => Promise<void>;
  destroy?: () => Promise<void>;
  primitives: PrivacyPrimitive[];
}

export interface PluginConfig {
  enabled: boolean;
  config: Record<string, any>;
}

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, PrivacyPlugin> = new Map();
  private registry: PrimitiveRegistry;
  private configs: Map<string, PluginConfig> = new Map();

  private constructor() {
    this.registry = PrimitiveRegistry.getInstance();
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Load a plugin
   */
  async loadPlugin(plugin: PrivacyPlugin): Promise<void> {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin already loaded: ${plugin.metadata.id}`);
    }

    // Set default config if not exists
    if (!this.configs.has(plugin.metadata.id)) {
      this.configs.set(plugin.metadata.id, {
        enabled: true,
        config: {}
      });
    }

    const config = this.configs.get(plugin.metadata.id)!;
    if (!config.enabled) {
      logger.info('Plugin not enabled', { id: plugin.metadata.id });
      return;
    }

    try {
      // Initialize the plugin
      await plugin.init(this.registry);

      // Register primitives
      for (const primitive of plugin.primitives) {
        this.registry.registerPrimitive(primitive);
      }

      this.plugins.set(plugin.metadata.id, plugin);
      logger.info('Plugin loaded successfully', {
        id: plugin.metadata.id,
        name: plugin.metadata.name,
        primitiveCount: plugin.primitives.length
      });
    } catch (error: unknown) { // Explicitly type error as unknown
      logger.error('Failed to load plugin', {
        id: plugin.metadata.id,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    try {
      // Call destroy if exists
      if (plugin.destroy) {
        await plugin.destroy();
      }

      // Unregister primitives
      for (const primitive of plugin.primitives) {
        this.registry.unregisterPrimitive(primitive.id);
      }

      this.plugins.delete(pluginId);
      logger.info('Plugin unloaded successfully', { id: pluginId });
      return true;
    } catch (error: unknown) { // Explicitly type error as unknown
      logger.error('Failed to unload plugin', {
        id: pluginId,
        error: (error as Error).message
      });
      return false;
    }
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): PrivacyPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): PrivacyPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Enable/disable a plugin
   */
  setPluginEnabled(pluginId: string, enabled: boolean): boolean {
    if (!this.plugins.has(pluginId)) {
      return false;
    }

    let config = this.configs.get(pluginId);
    if (!config) {
      config = { enabled: true, config: {} };
      this.configs.set(pluginId, config);
    }

    config.enabled = enabled;
    logger.info('Plugin enabled status changed', { id: pluginId, enabled });
    return true;
  }

  /**
   * Check if plugin is enabled
   */
  isPluginEnabled(pluginId: string): boolean {
    const config = this.configs.get(pluginId);
    return config ? config.enabled : false;
  }

  /**
   * Update plugin configuration
   */
  updatePluginConfig(pluginId: string, config: Record<string, any>): boolean {
    if (!this.plugins.has(pluginId)) {
      return false;
    }

    let pluginConfig = this.configs.get(pluginId);
    if (!pluginConfig) {
      pluginConfig = { enabled: true, config: {} };
      this.configs.set(pluginId, pluginConfig);
    }

    pluginConfig.config = { ...pluginConfig.config, ...config };
    return true;
  }

  /**
   * Get plugin configuration
   */
  getPluginConfig(pluginId: string): Record<string, any> | null {
    const config = this.configs.get(pluginId);
    return config ? { ...config.config } : null;
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(pluginId: string): PluginMetadata | undefined {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.metadata : undefined;
  }

  /**
   * Get all plugin metadata
   */
  getAllPluginMetadata(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map(plugin => plugin.metadata);
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // Unload first
    await this.unloadPlugin(pluginId);

    // Then load again
    try {
      await this.loadPlugin(plugin);
      return true;
    } catch (error: unknown) { // Explicitly type error as unknown
      logger.error('Failed to reload plugin', {
        id: pluginId,
        error: (error as Error).message
      });
      return false;
    }
  }
}