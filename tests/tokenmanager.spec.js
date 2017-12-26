const assert = require('chai').assert;
const nock = require('nock');

const TokenManager = require('../tokenmanager');

class MockTokenStore {
  constructor() {
    this.tokens = {};
  }
  getToken(k) {
    return new Promise(resolve => resolve(this.tokens[k]));
  }
  storeToken(k, v) {
    return new Promise((resolve) => { this.tokens[k] = v; resolve(); });
  }
}

const TEST_ARGS = {
  auth0Domain: 'example.com',
  auth0Client: 'TEST',
  auth0Secret: 'TEST',
  tokenStore: new MockTokenStore(),
};

describe('TokenManager', () => {
  it('should create a new tokenmanager when invoked', () => {
    const tm = new TokenManager(TEST_ARGS);
    assert.isOk(tm);
  });
  it('should be able to register a client', async () => {
    nock('https://example.com')
      .filteringRequestBody(() => 'x')
      .post(
        '/oauth/token',
        'x',
      )
      .reply(200, {
        access_token: 'abc123',
      });
    const tm = new TokenManager(TEST_ARGS);
    await tm.registerClient('service_name', 'service_audience');
    const token = await tm.getToken('service_name');
    assert.equal(token, 'abc123');
    nock.isDone();
  });
});
