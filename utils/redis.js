import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.log(err));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.get)
      .bind(this.client);
    return getAsync(key);
  }

  async set(key, value, expiration) {
    const setAsync = promisify(this.client.set)
      .bind(this.client);
    await setAsync(key, value, { EX: expiration });
  }

  async del(key) {
    const delAsync = promisify(this.client.del)
      .bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
