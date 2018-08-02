const assert = require('chai').assert;
const nock = require('nock');

const TokenManager = require('../tokenmanager');
const MockTokenStore = require('./mocktokenstore');

const TEST_ARGS = {
  auth0Domain: 'example.com',
  auth0Client: 'TEST_CLIENT_ID',
  auth0Secret: 'TEST_CLIENT_SECRET',
  tokenStore: new MockTokenStore(),
  audiences: { foo: 'bar' },
};

describe('TokenManager', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should create a new tokenmanager when invoked', () => {
    const tm = new TokenManager(TEST_ARGS);
    assert.isOk(tm);
  });

  it('should be able to refresh tokens', async () => {
    const tm = new TokenManager(TEST_ARGS);
    nock('https://example.com')
      .post(
        '/oauth/token',
        {
          grant_type: 'client_credentials',
          client_id: 'TEST_CLIENT_ID',
          client_secret: 'TEST_CLIENT_SECRET',
          audience: 'bar',
        },
      )
      .reply(200, {
        access_token: 'efg456',
      });

    const token1 = await tm.getToken('foo');
    assert.strictEqual(token1, 'efg456');
  });

  it('should be able to refresh all tokens', async () => {
    const tm = new TokenManager(TEST_ARGS);
    nock('https://example.com')
      .post(
        '/oauth/token',
        {
          grant_type: 'client_credentials',
          client_id: 'TEST_CLIENT_ID',
          client_secret: 'TEST_CLIENT_SECRET',
          audience: 'bar',
        },
      )
      .reply(200, {
        access_token: 'efg456',
      });

    await tm.refreshAllTokens();
    const token1 = await tm.getToken('foo');
    assert.strictEqual(token1, 'efg456');
  });
});
