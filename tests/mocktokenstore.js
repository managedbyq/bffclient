class MockTokenStore {
  constructor() {
    this.tokens = {};
  }
  getToken(k) {
    return new Promise(resolve => resolve(this.tokens[k]));
  }
  storeToken(k, v) {
    return new Promise((resolve) => { this.tokens[k] = v; resolve(); });
  }
}

module.exports = MockTokenStore;
