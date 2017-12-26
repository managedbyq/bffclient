const superagent = require('superagent');

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
  }

  async registerClient(serviceName, audience) {
    this.audiences[serviceName] = audience;
    await this.refreshAccessToken(serviceName);
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
    const response = await superagent
      .post(`https://${this.auth0Domain}/oauth/token`)
      .set('content-type', 'application/json')
      .send({
        grant_type: 'client_credentials',
        client_id: this.auth0Client,
        client_secret: this.auth0Secret,
        audience: this.audiences[serviceName],
      });
    const accessToken = response.body.access_token;
    if (accessToken) {
      await this.tokenStore.storeToken(`${serviceName}-access-token`, accessToken);
    } else {
      throw new Error('Access token is undefined');
    }
    return accessToken;
  }
}

module.exports = TokenManager;
