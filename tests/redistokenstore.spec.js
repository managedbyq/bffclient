const assert = require('chai').assert;
const client = require('fakeredis').createClient('fake_redis');

const RedisTokenStore = require('../stores/redistokenstore');

describe('RedisTokenStore', () => {
  it('Should store tokens', async () => {
    const rts = new RedisTokenStore('fake_redis', client);
    await rts.storeToken('key', 'TOKEN_VALUE');
    const token = await rts.getToken('key');
    assert.strictEqual(token, 'TOKEN_VALUE');
  });
});

