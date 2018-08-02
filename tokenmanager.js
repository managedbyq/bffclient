const axios = require('axios');

class TokenManager {
  constructor({
    auth0Domain,
    auth0Client,
    auth0Secret,
    tokenStore,
    audiences,
  }) {
    this.auth0Domain = auth0Domain;
    this.auth0Client = auth0Client;
    this.auth0Secret = auth0Secret;
    this.tokenStore = tokenStore;
    this.audiences = audiences;
  }

  async getToken(audienceName) {
    try {
      let token = await this.tokenStore.getToken(`${audienceName}-access-token`);
      if (!token) {
        token = await this.refreshAccessToken(audienceName);
      }
      return token;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async refreshAccessToken(audienceName) {
    const response = await axios({
      url: `https://${this.auth0Domain}/oauth/token`,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      data: {
        grant_type: 'client_credentials',
        client_id: this.auth0Client,
        client_secret: this.auth0Secret,
        audience: this.audiences[audienceName],
      },
    });

    const accessToken = response.data.access_token;

    if (accessToken) {
      await this.tokenStore.storeToken(`${audienceName}-access-token`, accessToken);
    } else {
      throw new Error('Access token is undefined');
    }

    return accessToken;
  }

  async refreshAllTokens() {
    Object.keys(this.audiences).forEach(async (name) => {
      await this.refreshAccessToken(name);
    });
  }
}

module.exports = TokenManager;
