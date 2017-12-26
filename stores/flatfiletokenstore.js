const fs = require('fs');

class FlatFileTokenStore {
  constructor(filePath = './flatfilestorage') {
    this.filePath = filePath;

    try {
      this.tokenCache = JSON.parse(fs.readFileSync(filePath));
      if (!this.tokenCache) {
        this.tokenCache = {};
      }
    } catch (e) {
      this.tokenCache = {};
    }
  }

  async storeToken(serviceName, value) {
    this.tokenCache[serviceName] = value;
    return this.saveTokens();
  }

  async getToken(serviceName) {
    return new Promise((resolve) => {
      resolve(this.tokenCache[serviceName]);
    });
  }

  saveTokens() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, JSON.stringify(this.tokenCache), (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = FlatFileTokenStore;
