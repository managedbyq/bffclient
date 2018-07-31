const assert = require('chai').assert;
const FakeRedis = require('ioredis-mock');

const RedisTokenStore = require('../stores/redistokenstore');

describe('RedisTokenStore', () => {
  it('Should store tokens', async () => {
    const rts = new RedisTokenStore('fake_redis', new FakeRedis());
    await rts.storeToken('key', 'TOKEN_VALUE');
    const token = await rts.getToken('key');
    assert.strictEqual(token, 'TOKEN_VALUE');
  });
});

