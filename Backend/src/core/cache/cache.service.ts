import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value as T;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl : undefined;
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async reset(): Promise<void> {
    this.cache.clear();
  }
}