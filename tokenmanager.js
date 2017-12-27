const axios = require('axios');

class TokenManager {
  constructor({
    auth0Domain,
    auth0Client,
    auth0Secret,
    tokenStore,
  }) {
    this.auth0Domain = auth0Domain;
    this.auth0Client = auth0Client;
    this.auth0Secret = auth0Secret;
    this.tokenStore = tokenStore;
    this.audiences = {};

    this.intervals = {};
  }

  registerClient(serviceName, audience, refreshRate) {
    this.audiences[serviceName] = audience;

    if (refreshRate) {
      this.intervals[serviceName] = setInterval(() => {
        this.refreshAccessToken(serviceName, refreshRate);
      }, refreshRate);
    }
  }

  async getToken(serviceName) {
    try {
      let token = await this.tokenStore.getToken(`${serviceName}-access-token`);
      if (!token) {
        token = await this.refreshAccessToken(serviceName);
      }
      return token;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async refreshAccessToken(serviceName) {
    const response = await axios({
      url: `https://${this.auth0Domain}/oauth/token`,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      data: {
        grant_type: 'client_credentials',
        client_id: this.auth0Client,
        client_secret: this.auth0Secret,
        audience: this.audiences[serviceName],
      },
    });

    const accessToken = response.data.access_token;

    if (accessToken) {
      await this.tokenStore.storeToken(`${serviceName}-access-token`, accessToken);
    } else {
      throw new Error('Access token is undefined');
    }

    return accessToken;
  }

  removeClient(serviceName) {
    delete this.audiences[serviceName];
    clearTimeout(this.intervals[serviceName]);
    delete this.intervals[serviceName];
  }
}

module.exports = TokenManager;
