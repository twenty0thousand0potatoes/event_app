import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS_SESSION_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_SESSION_CLIENT, 
      useFactory: async () => {
        const client = createClient({
          url: 'redis://localhost:6379'
        });
        await client.connect();
        return client;
      }
    }, RedisService
  ],
  exports: [REDIS_SESSION_CLIENT, RedisService],
})
export class RedisModule {}