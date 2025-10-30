import { PrivacyPrimitive, PrivacyWorkflow } from '../types'; // Updated import path
import { logger } from '../utils/logger';

export interface PrimitiveMetadata {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class PrimitiveRegistry {
  private static instance: PrimitiveRegistry;
  private primitives: Map<string, PrivacyPrimitive> = new Map();
  private workflows: Map<string, PrivacyWorkflow> = new Map();
  private metadata: Map<string, PrimitiveMetadata> = new Map();
  private categories: Map<string, string[]> = new Map(); // category -> primitive IDs

  private constructor() {}

  static getInstance(): PrimitiveRegistry {
    if (!PrimitiveRegistry.instance) {
      PrimitiveRegistry.instance = new PrimitiveRegistry();
    }
    return PrimitiveRegistry.instance;
  }

  /**
   * Register a new privacy primitive
   */
  registerPrimitive(primitive: PrivacyPrimitive): void {
    this.primitives.set(primitive.id, primitive);
    
    // Create metadata
    const metadata: PrimitiveMetadata = {
      id: primitive.id,
      name: primitive.name,
      category: primitive.category,
      version: primitive.version,
      description: primitive.description,
      author: primitive.author,
      tags: primitive.tags,
      dependencies: primitive.dependencies,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.metadata.set(primitive.id, metadata);
    
    // Add to category index
    if (!this.categories.has(primitive.category)) {
      this.categories.set(primitive.category, []);
    }
    const categoryList = this.categories.get(primitive.category)!;
    if (!categoryList.includes(primitive.id)) {
      categoryList.push(primitive.id);
    }
    
    logger.info('Primitive registered', { 
      id: primitive.id, 
      name: primitive.name, 
      category: primitive.category 
    });
  }

  /**
   * Unregister a privacy primitive
   */
  unregisterPrimitive(id: string): boolean {
    const primitive = this.primitives.get(id);
    if (!primitive) {
      return false;
    }
    
    this.primitives.delete(id);
    this.metadata.delete(id);
    
    // Remove from category index
    const categoryList = this.categories.get(primitive.category);
    if (categoryList) {
      const index = categoryList.indexOf(id);
      if (index !== -1) {
        categoryList.splice(index, 1);
      }
    }
    
    logger.info('Primitive unregistered', { id });
    return true;
  }

  /**
   * Get a primitive by ID
   */
  getPrimitive(id: string): PrivacyPrimitive | undefined {
    return this.primitives.get(id);
  }

  /**
   * Get primitive metadata by ID
   */
  getMetadata(id: string): PrimitiveMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Get all primitives in a category
   */
  getPrimitivesByCategory(category: string): PrivacyPrimitive[] {
    const ids = this.categories.get(category) || [];
    return ids.map(id => this.primitives.get(id)!).filter(Boolean);
  }

  /**
   * Get all primitive IDs
   */
  getAllPrimitiveIds(): string[] {
    return Array.from(this.primitives.keys());
  }

  /**
   * Get all primitives
   */
  getAllPrimitives(): PrivacyPrimitive[] {
    return Array.from(this.primitives.values());
  }

  /**
   * Search primitives by tags or name
   */
  searchPrimitives(query: string): PrivacyPrimitive[] {
    const queryLower = query.toLowerCase();
    return this.getAllPrimitives().filter(primitive => {
      return (
        primitive.name.toLowerCase().includes(queryLower) ||
        primitive.description.toLowerCase().includes(queryLower) ||
        primitive.tags.some((tag: string) => tag.toLowerCase().includes(queryLower)) // Explicitly type tag
      );
    });
  }

  /**
   * Register a privacy workflow
   */
  registerWorkflow(workflow: PrivacyWorkflow): void {
    this.workflows.set(workflow.id, workflow);
    logger.info('Workflow registered', { id: workflow.id, name: workflow.name });
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(id: string): PrivacyWorkflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): PrivacyWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get primitives count by category
   */
  getPrimitiveCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [category, primitives] of this.categories.entries()) {
      counts[category] = primitives.length;
    }
    return counts;
  }

  /**
   * Update primitive metadata
   */
  updateMetadata(id: string, updates: Partial<PrimitiveMetadata>): boolean {
    const metadata = this.metadata.get(id);
    if (!metadata) {
      return false;
    }

    Object.assign(metadata, updates, { updatedAt: new Date() });
    return true;
  }
}
