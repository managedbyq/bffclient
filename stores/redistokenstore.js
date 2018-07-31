const Redis = require('ioredis');

class RedisTokenStore {
  constructor(redisUrl, redis) {
    this.redisClient = redis || new Redis(redisUrl);
  }

  async storeToken(key, value) {
    return new Promise((resolve, reject) => {
      if (!key) {
        reject(new Error('No access token provided to store in redis'));
      }
      this.redisClient.set(key, value, 'EX', 86400, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async getToken(key) {
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      });
    });
  }
}

module.exports = RedisTokenStore;
