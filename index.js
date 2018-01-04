const axios = require('axios');

const TokenManager = require('./tokenmanager');

// Just for exporting
const FlatFileTokenStore = require('./stores/flatfiletokenstore');
const RedisTokenStore = require('./stores/redistokenstore');

class ServiceClient {
  constructor(serviceName, url, tokenManager) {
    // Do not create -- use a ServiceClientFactory
    this.serviceName = serviceName;
    this.tokenManager = tokenManager;
    this.url = url;
  }

  async refreshToken() {
    try {
      await this.tokenManager.refreshAccessToken(this.serviceName);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getAuthHeaders() {
    try {
      const token = await this.tokenManager.getToken(this.serviceName);
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async request(method, path, {
    headers = {}, params = {}, data = {}, timeout = 5000,
  }) {
    const authHeaders = await this.getAuthHeaders();
    headers = {
      ...this.defaultHeaders,
      ...authHeaders,
      ...headers,
    };

    const url = this.url + path;

    return axios({
      url, method, headers, params, data, timeout,
    });
  }

  get(path, options = {}) {
    return this.request('GET', path, options);
  }

  post(path, options = {}) {
    return this.request('POST', path, options);
  }

  patch(path, options = {}) {
    return this.request('PATCH', path, options);
  }

  put(path, options = {}) {
    return this.request('PUT', path, options);
  }

  delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }
}

class ServiceClientFactory {
  constructor() {
    this.initialized = false;
  }

  init({
    auth0Domain,
    auth0Client,
    auth0Secret,
    tokenStore,
  }) {
    this.initialized = true;
    this.tokenManager = new TokenManager({
      tokenStore,
      auth0Domain,
      auth0Client,
      auth0Secret,
    });
  }

  createServiceClient(serviceName, url, audience, tokenRefreshRate) {
    if (!this.initialized) {
      throw new Error('Cannot create client in uninitialized ServiceClientFactory');
    }

    this.tokenManager.registerClient(serviceName, audience, tokenRefreshRate);

    return new ServiceClient(serviceName, url, this.tokenManager);
  }
}

const factory = new ServiceClientFactory();

factory.stores = {
  RedisTokenStore,
  FlatFileTokenStore,
};

module.exports = factory;
