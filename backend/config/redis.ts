import Redis from 'ioredis';
// @ts-ignore
import RedisMock from 'ioredis-mock';

let redis: Redis;

if (process.env.REDIS_URL) {
  console.log('✅ Connecting to Redis at', process.env.REDIS_URL);
  redis = new Redis(process.env.REDIS_URL);
} else {
  console.log('⚠️  No REDIS_URL set — using in-memory Redis mock');
  redis = new RedisMock();
}

export default redis;
