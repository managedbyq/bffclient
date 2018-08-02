const assert = require('chai').assert;
const nock = require('nock');

const MockTokenStore = require('./mocktokenstore');
const ServiceClient = require('../client');

describe('ServiceClient without correlation IDs', () => {
  let serviceClient;
  let mockedTokenManager;

  beforeEach(async () => {
    mockedTokenManager = new MockTokenStore();
    mockedTokenManager.storeToken('tokenName', 'BEARER_TOKEN');
    serviceClient = new ServiceClient(
      'https://example.com',
      mockedTokenManager,
      'tokenName',
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
  let mockedTokenManager;

  beforeEach(async () => {
    mockedTokenManager = new MockTokenStore();
    mockedTokenManager.storeToken('tokenName', 'BEARER_TOKEN');
    correlatingClient = new ServiceClient(
      'https://example.com',
      mockedTokenManager,
      'tokenName',
      () => 'abc123',
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
