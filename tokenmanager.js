const superagent = require('superagent');

class TokenManager {
  constructor({
    auth0Domain = '',
    auth0Client = '',
    auth0Secret = '',
    tokenStore = null,
  }) {
    this.auth0Domain = auth0Domain;
    this.auth0Client = auth0Client;
    this.auth0Secret = auth0Secret;
    this.tokenStore = tokenStore;
    this.audiences = {};
  }

  registerClient(key, audience) {
    this.audiences[key] = audience;
    this.refreshAccessToken(key);
  }

  async getToken(key) {
    try {
      let token = await this.tokenStore.getToken(`${key}-access-token`);

      if (!token) {
        token = await this.refreshAccessToken(key);
      }

      return token;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  refreshAccessToken(key) {
    return new Promise((resolve, reject) => {
      superagent
        .post(`https://${this.auth0Domain}/oauth/token`)
        .set('content-type', 'application/json')
        .send({
          grant_type: 'client_credentials',
          client_id: this.auth0Client,
          client_secret: this.auth0Secret,
          audience: this.audiences[key],
        })
        .then(res => res.body.access_token)
        .catch(err => reject(err))
        .then((accessToken) => {
          if (accessToken) {
            this.tokenStore.storeToken(`${key}-access-token`, accessToken)
              .catch(err => reject(err))
              .then(() => resolve(accessToken));
          } else {
            return reject(new Error('Access token is undefined'));
          }
        });
    });
  }
}

module.exports = TokenManager;
