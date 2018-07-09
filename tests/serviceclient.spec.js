const assert = require('chai').assert;
const nock = require('nock');

const utils = require('../utils');
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

  it('should not create a ServiceClient when uninitialized', () => {
    assert.throws(() => ServiceClientFactory.createServiceClient(
      'uninitialized_service_client_factory',
      'http://example.com',
      'audience_string',
    ), 'Cannot create client in uninitialized ServiceClientFactory');
  });

  it('should create a ServiceClient when initialized', async () => {
    ServiceClientFactory.init({
      auth0Domain: 'auth0.example.com',
      auth0Client: 'TEST_CLIENT_ID_INIT',
      auth0Secret: 'TEST_CLIENT_SECRET_INIT',
      tokenStore: new MockTokenStore(),
    });
    const sc = ServiceClientFactory.createServiceClient(
      'initialized_service_client_factory',
      'http://example.com',
      'audience_string',
    );
    assert.isOk(sc);
    assert.isTrue(nock.isDone());
  });

  it('should create a ServiceClient with a correlation ID getter', async () => {
    ServiceClientFactory.init({
      auth0Domain: 'auth0.example.com',
      auth0Client: 'TEST_CLIENT_ID_INIT',
      auth0Secret: 'TEST_CLIENT_SECRET_INIT',
      tokenStore: new MockTokenStore(),
      getCorrelationId: () => 'correlation_id',
    });
    const sc = ServiceClientFactory.createServiceClient(
      'service_with_correlation_id_getter',
      'http://example.com',
      'audience_string',
    );
    assert.isOk(sc);
    assert.isFunction(sc.getCorrelationId);
    assert.notStrictEqual(sc.getCorrelationId, utils.noop);
    assert.isTrue(nock.isDone());
  });
});

describe('ServiceClient without correlation IDs', () => {
  let ServiceClientFactory;
  let serviceClient;

  beforeEach(async () => {
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

    // eslint-disable-next-line global-require
    ServiceClientFactory = require('../index');
    ServiceClientFactory.init({
      auth0Domain: 'auth0.example.com',
      auth0Client: 'TEST_CLIENT_ID',
      auth0Secret: 'TEST_CLIENT_SECRET',
      tokenStore: new MockTokenStore(),
    });
    serviceClient = ServiceClientFactory.createServiceClient(
      'service_client',
      'https://example.com',
      'audience_string',
    );
  });

  it('should be able to GET', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', '123')
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
    assert.isTrue(nock.isDone());
  });

  it('should be able to POST', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', '123')
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
    assert.isTrue(nock.isDone());
  });

  it('should be able to PUT', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', '123')
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
    assert.isTrue(nock.isDone());
  });

  it('should be able to PATCH', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', '123')
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
    assert.isTrue(nock.isDone());
  });

  it('should be able to DELETE', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .matchHeader('header_content', '123')
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
    assert.isTrue(nock.isDone());
  });

  it('should allow axios properties to pass through as options', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .delete('/delete?my_params')
      .reply(200, { ok: true });

    const response = await serviceClient.delete(
      '/delete',
      {
        paramsSerializer: () => 'my_params',
        params: { query_string: 'abc' },
      },
    );

    assert.isTrue(response.data.ok);
    assert.isTrue(nock.isDone());
  });

  it('should be able to refresh its access tokens', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .get('/token_test')
      .reply(200, { ok: true });

    await serviceClient.get('/token_test');

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
        access_token: 'ANOTHER_TOKEN',
      });

    await serviceClient.refreshToken();

    nock('https://example.com')
      .matchHeader('authorization', 'Bearer ANOTHER_TOKEN')
      .get('/token_test_2')
      .reply(200, { ok: true });

    await serviceClient.get('/token_test_2');
    assert.isTrue(nock.isDone());
  });

  it('should repeat multiple query params by default', async () => {
    nock('https://example.com')
      .matchHeader('authorization', 'Bearer BEARER_TOKEN')
      .get('/repeating?foo=1&foo=2')
      .reply(200, { ok: true });

    const response = await serviceClient.get(
      '/repeating',
      {
        params: { foo: [1, 2] },
      },
    );

    assert.isTrue(response.data.ok);
    assert.isTrue(nock.isDone());
  });

  it('should not include a correlation id if a getter was not passed to the ServiceClient', async () => {
    nock('https://example.com', { badHeaders: ['x-correlation-id'] })
      .get('/test')
      .reply(200, { ok: true });

    const response = await serviceClient.get('/test');

    assert.isTrue(response.data.ok);
    assert.isTrue(nock.isDone());
  });
});

describe('ServiceClient with correlation IDs', () => {
  let correlatingClient;

  beforeEach(async () => {
    nock('https://auth0.example.com')
      .post('/oauth/token', {
        grant_type: /.*/,
        client_id: 'TEST_CLIENT_ID',
        client_secret: 'TEST_CLIENT_SECRET',
        audience: 'audience_string',
      }).reply(200, { access_token: 'BEARER_TOKEN' });

    // eslint-disable-next-line global-require
    const ServiceClientFactory = require('../index');
    ServiceClientFactory.init({
      auth0Domain: 'auth0.example.com',
      auth0Client: 'TEST_CLIENT_ID',
      auth0Secret: 'TEST_CLIENT_SECRET',
      tokenStore: new MockTokenStore(),
      getCorrelationId: () => 'abc123',
    });
    correlatingClient = ServiceClientFactory.createServiceClient(
      'service_client',
      'https://example.com',
      'audience_string',
    );
  });

  it('should include a correlation ID if a getter was passed to the ServiceClient', async () => {
    nock('https://example.com')
      .matchHeader('x-correlation-id', 'abc123')
      .get('/test')
      .reply(200, { ok: true });

    const response = await correlatingClient.get('/test');

    assert.isTrue(response.data.ok);
    assert.isTrue(nock.isDone());
  });
});
