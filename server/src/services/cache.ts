export class SimpleCache {
  private cache: Map<string, { value: any; expiry: number }>;
  private defaultTtl: number; // in milliseconds

  constructor(defaultTtl: number = 0) { // 0 means no expiry by default
    this.cache = new Map<string, { value: any; expiry: number }>();
    this.defaultTtl = defaultTtl;
  }

  public get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) {
      return undefined;
    }
    if (this.defaultTtl > 0 && item.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return item.value as T;
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    const expiry = (ttl || this.defaultTtl) > 0 ? Date.now() + (ttl || this.defaultTtl) : Infinity;
    this.cache.set(key, { value, expiry });
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();