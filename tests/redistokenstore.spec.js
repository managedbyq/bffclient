const assert = require('chai').assert;
const fakeRedis = require('fakeredis');

const RedisTokenStore = require('../stores/redistokenstore');

describe('RedisTokenStore', () => {
  it('Should store tokens', async () => {
    const rts = new RedisTokenStore('fake_redis', fakeRedis);
    await rts.storeToken('key', 'TOKEN_VALUE');
    const token = await rts.getToken('key');
    assert.strictEqual(token, 'TOKEN_VALUE');
  });
});

