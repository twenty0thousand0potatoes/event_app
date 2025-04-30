import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_SESSION_CLIENT } from './redis.constants';
 
@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_SESSION_CLIENT) private readonly redisClient: Redis) {}

  async setWithTTL(
    key: string,
    value: string,
    expirySeconds: number,
  ): Promise<void> {
    await this.redisClient.set(key, value, 'EX', expirySeconds);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async incrementAttempts(key: string): Promise<number> {
    return this.redisClient.incr(`${key}:attempts`);
  }

  async getAttempts(key: string): Promise<number> {
    const attempts = await this.redisClient.get(`${key}:attempts`);
    return attempts ? parseInt(attempts, 10) : 0;
  }
}
