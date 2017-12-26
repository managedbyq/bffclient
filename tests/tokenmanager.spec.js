const assert = require('chai').assert;
const nock = require('nock');

const TokenManager = require('../tokenmanager');
const MockTokenStore = require('./mocktokenstore');

const TEST_ARGS = {
  auth0Domain: 'example.com',
  auth0Client: 'TEST_CLIENT_ID',
  auth0Secret: 'TEST_CLIENT_SECRET',
  tokenStore: new MockTokenStore(),
};

const sleep = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

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
    assert.strictEqual(token, 'abc123');
    tm.removeClient('service_name');
    nock.isDone();
  });

  it('should send the correct headers to auth0', async () => {
    nock('https://example.com')
      .post(
        '/oauth/token',
        {
          grant_type: /.*/,
          client_id: 'TEST_CLIENT_ID',
          client_secret: 'TEST_CLIENT_SECRET',
          audience: 'service_audience',
        },
      )
      .reply(200, {
        access_token: 'abc123',
      });
    const tm = new TokenManager(TEST_ARGS);
    await tm.registerClient('service_name', 'service_audience');
    tm.removeClient('service_name');
    nock.isDone();
  });

  it('should refresh tokens automatically', async () => {
    nock('https://example.com')
      .post(
        '/oauth/token',
        {
          grant_type: /.*/,
          client_id: 'TEST_CLIENT_ID',
          client_secret: 'TEST_CLIENT_SECRET',
          audience: 'service_audience',
        },
      )
      .reply(200, {
        access_token: 'efg456',
      });

    const tm = new TokenManager(TEST_ARGS);
    await tm.registerClient('auto_service', 'service_audience', 10);

    const token1 = await tm.getToken('auto_service');
    assert.strictEqual(token1, 'efg456');

    const asyncNock = () => new Promise(resolve =>
      nock('https://example.com')
        .post(
          '/oauth/token',
          {
            grant_type: /.*/,
            client_id: 'TEST_CLIENT_ID',
            client_secret: 'TEST_CLIENT_SECRET',
            audience: 'service_audience',
          },
        )
        .reply(200, () => {
          resolve();
          return {
            access_token: 'ghi789',
          };
        }));

    await asyncNock();
    tm.removeClient('auto_service');

    const token2 = await tm.getToken('auto_service');
    assert.strictEqual(token2, 'efg456');
  });
});
