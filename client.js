const axios = require('axios');
const Qs = require('qs');

const utils = require('./utils');

class ServiceClient {
  constructor(url, tokenManager, tokenName, getCorrelationId) {
    this.tokenManager = tokenManager;
    this.url = url;
    this.getCorrelationId = getCorrelationId || utils.noop;
    this.tokenName = tokenName;
  }

  async getAuthHeaders() {
    try {
      const token = await this.tokenManager.getToken(this.tokenName);
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async request(method, path, options) {
    const authHeaders = await this.getAuthHeaders();
    const correlationId = this.getCorrelationId();

    const headers = {
      ...this.defaultHeaders,
      ...authHeaders,
      ...options.headers,
    };

    if (correlationId) {
      headers['x-correlation-id'] = correlationId;
    }

    const url = this.url + path;

    if (!options.paramsSerializer) {
      options.paramsSerializer = params => Qs.stringify(params, { arrayFormat: 'repeat' });
    }

    return axios({
      url, method, ...options, headers,
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

module.exports = ServiceClient;
