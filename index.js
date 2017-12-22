const superagent = require('superagent');

const TokenManager = require('./tokenmanager');

// Just for exporting
const FlatFileTokenStore = require('./stores/flatfiletokenstore');
const RedisTokenStore = require('./stores/redistokenstore');

class ServiceClient {
  constructor(key, url, tokenManager) {
    this.key = key;
    this.tokenManager = tokenManager;
    this.url = url;
  }

  async getAuthHeaders() {
    try {
      const token = await this.tokenManager.getToken(this.key);
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async request(method, path, { headers = {}, query = {}, body = {} }) {
    const authHeaders = await this.getAuthHeaders();
    headers = {
      ...this.defaultHeaders,
      ...authHeaders,
      ...headers,
    };

    const url = this.url + path;

    return superagent(method, url)
      .set(headers)
      .query(query)
      .send(body)
      .timeout(5000);
  }

  get(path, options) {
    return this.request('GET', path, options);
  }

  post(path, options) {
    return this.request('POST', path, options);
  }

  patch(path, options) {
    return this.request('PATCH', path, options);
  }

  put(path, options) {
    return this.request('PUT', path, options);
  }

  delete(path, options) {
    return this.request('DELETE', path, options);
  }
}

class ServiceClientFactory {
  constructor() {
    this.initialized = false;
  }

  init({
    auth0Domain = '',
    auth0Client = '',
    auth0Secret = '',
    tokenStore = null,
  }) {
    this.initialized = true;
    this.tokenManager = new TokenManager({
      tokenStore,
      auth0Domain,
      auth0Client,
      auth0Secret,
    });
  }

  createServiceClient(key, url, audience) {
    if (!this.initialized) {
      throw new Error('Cannot create client in uninitialized ServiceClientFactory');
    }

    this.tokenManager.registerClient(key, audience);

    return new ServiceClient(key, url, this.tokenManager);
  }
}

const factory = new ServiceClientFactory();

factory.stores = {
  RedisTokenStore,
  FlatFileTokenStore
}

module.exports = factory;
