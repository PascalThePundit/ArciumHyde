import { logger } from '../utils/logger';
import { hashPassword, verifyPassword } from '../utils/helpers';

export interface User {
  id?: string;
  email: string;
  name: string;
  organization?: string;
  useCase?: string;
  apiKey: string;
  hashedApiKey?: string; // For storage
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static users: Map<string, User> = new Map();
  private static apiKeyToUserId: Map<string, string> = new Map(); // apiKey -> userId mapping

  /**
   * Create a new user
   */
  static async createUser(userData: Omit<User, 'id' | 'hashedApiKey'>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Hash the API key for storage
    const hashedApiKey = await hashPassword(userData.apiKey);
    
    const user: User = {
      ...userData,
      id,
      hashedApiKey,
      updatedAt: new Date()
    };

    this.users.set(id, user);
    this.apiKeyToUserId.set(userData.apiKey, id);
    
    logger.info(`User created: ${id}`, { email: userData.email, organization: userData.organization });
    
    return user;
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return { ...user, hashedApiKey: undefined }; // Don't return hashed API key
      }
    }
    return undefined;
  }

  /**
   * Find a user by API key
   */
  static async findByApiKey(apiKey: string): Promise<User | undefined> {
    const userId = this.apiKeyToUserId.get(apiKey);
    if (userId) {
      const user = this.users.get(userId);
      if (user) {
        // Verify the API key
        const isValid = await verifyPassword(apiKey, user.hashedApiKey || '');
        if (isValid) {
          return { ...user, hashedApiKey: undefined }; // Don't return hashed API key
        }
      }
    }
    return undefined;
  }

  /**
   * Update user credits
   */
  static async updateCredits(userId: string, amount: number): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    user.credits += amount;
    user.updatedAt = new Date();
    
    // Ensure credits don't go below 0
    if (user.credits < 0) {
      user.credits = 0;
    }

    logger.info(`User credits updated: ${userId}`, { amount, newBalance: user.credits });
    
    return { ...user, hashedApiKey: undefined };
  }

  /**
   * Find all users
   */
  static findAll(): User[] {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      hashedApiKey: undefined
    }));
  }

  /**
   * Get user by ID
   */
  static getById(userId: string): User | undefined {
    const user = this.users.get(userId);
    if (user) {
      return { ...user, hashedApiKey: undefined };
    }
    return undefined;
  }

  /**
   * Deduct credits for an operation
   */
  static async deductCredits(userId: string, amount: number): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    if (user.credits < amount) {
      logger.warn(`Insufficient credits for user: ${userId}`, { 
        required: amount, 
        available: user.credits 
      });
      return false;
    }

    user.credits -= amount;
    user.updatedAt = new Date();
    
    logger.info(`Credits deducted for user: ${userId}`, { 
      amount, 
      remaining: user.credits 
    });

    return true;
  }
}