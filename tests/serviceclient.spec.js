const assert = require('chai').assert;
const nock = require('nock');

const MockTokenStore = require('./mocktokenstore');

describe('ServiceClientFactory', () => {
  let ServiceClientFactory;

  beforeEach(() => {
    // eslint-disable-next-line global-require
    ServiceClientFactory = require('../index');
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should not create a ServiceClient when uninitialized', (done) => {
    ServiceClientFactory.createServiceClient(
      'uninitialized_service_client_factory',
      'http://example.com',
      'audience_string',
    ).catch((err) => {
      assert.strictEqual(err.message, 'Cannot create client in uninitialized ServiceClientFactory');
      done();
    });
  });
  it('should create a ServiceClient when initialized', async () => {
    nock('https://auth0.example.com')
      .post(
        '/oauth/token',
        {
          grant_type: /.*/,
          client_id: 'TEST_CLIENT_ID_INIT',
          client_secret: 'TEST_CLIENT_SECRET_INIT',
          audience: 'audience_string',
        },
      )
      .reply(200, {
        access_token: 'abc123',
      });
    ServiceClientFactory.init({
      auth0Domain: 'auth0.example.com',
      auth0Client: 'TEST_CLIENT_ID_INIT',
      auth0Secret: 'TEST_CLIENT_SECRET_INIT',
      tokenStore: new MockTokenStore(),
    });
    const sc = await ServiceClientFactory.createServiceClient(
      'initialized_service_client_factory',
      'http://example.com',
      'audience_string',
    );
    assert.isOk(sc);
    nock.isDone();
  });
});

describe('ServiceClient', () => {
  let serviceClient;
  before(async () => {
    // eslint-disable-next-line global-require
    const ServiceClientFactory = require('../index');
    nock('https://auth0.example.com')
      .post(
        '/oauth/token',
        {
          grant_type: /.*/,
          client_id: 'TEST_CLIENT_ID',
          client_secret: 'TEST_CLIENT_SECRET',
          audience: 'audience_string',
        },
      )
      .reply(200, {
        access_token: 'BEARER_TOKEN',
      });
    ServiceClientFactory.init({
      auth0Domain: 'auth0.example.com',
      auth0Client: 'TEST_CLIENT_ID',
      auth0Secret: 'TEST_CLIENT_SECRET',
      tokenStore: new MockTokenStore(),
    });
    serviceClient = await ServiceClientFactory.createServiceClient(
      'service_client',
      'https://example.com',
      'audience_string',
    );
    nock.isDone();
  });

  it('should be able to GET', async () => {
    nock('https://example.com')
      .matchHeader('authorization', val => val === 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', val => val === '123')
      .get('/get?query_string=abc', { body_content: 'xyz' })
      .reply(200, { ok: true });
    const response = await serviceClient.get(
      '/get',
      {
        params: { query_string: 'abc' },
        data: { body_content: 'xyz' },
        headers: { header_content: '123' },
      },
    );
    assert.isTrue(response.data.ok);
  });

  it('should be able to POST', async () => {
    nock('https://example.com')
      .matchHeader('authorization', val => val === 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', val => val === '123')
      .post('/post?query_string=abc', { body_content: 'xyz' })
      .reply(200, { ok: true });
    const response = await serviceClient.post(
      '/post',
      {
        params: { query_string: 'abc' },
        data: { body_content: 'xyz' },
        headers: { header_content: '123' },
      },
    );
    assert.isTrue(response.data.ok);
  });

  it('should be able to PUT', async () => {
    nock('https://example.com')
      .matchHeader('authorization', val => val === 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', val => val === '123')
      .put('/put?query_string=abc', { body_content: 'xyz' })
      .reply(200, { ok: true });
    const response = await serviceClient.put(
      '/put',
      {
        params: { query_string: 'abc' },
        data: { body_content: 'xyz' },
        headers: { header_content: '123' },
      },
    );
    assert.isTrue(response.data.ok);
  });

  it('should be able to PATCH', async () => {
    nock('https://example.com')
      .matchHeader('authorization', val => val === 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', val => val === '123')
      .patch('/patch?query_string=abc', { body_content: 'xyz' })
      .reply(200, { ok: true });
    const response = await serviceClient.patch(
      '/patch',
      {
        params: { query_string: 'abc' },
        data: { body_content: 'xyz' },
        headers: { header_content: '123' },
      },
    );
    assert.isTrue(response.data.ok);
  });

  it('should be able to DELETE', async () => {
    nock('https://example.com')
      .matchHeader('authorization', val => val === 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', val => val === '123')
      .delete('/delete?query_string=abc', { body_content: 'xyz' })
      .reply(200, { ok: true });
    const response = await serviceClient.delete(
      '/delete',
      {
        params: { query_string: 'abc' },
        data: { body_content: 'xyz' },
        headers: { header_content: '123' },
      },
    );
    assert.isTrue(response.data.ok);
  });
});
