const fs = require('fs');

class FlatFileTokenStore {
  constructor(filePath = './flatfilestorage') {
    this.filePath = filePath;

    try {
      this.keysCache = JSON.parse(fs.readFileSync(filePath));
      if (!this.keysCache) {
        this.keysCache = {};
      }
    } catch (e) {
      this.keysCache = {};
    }
  }

  async storeToken(key, value) {
    this.keysCache[key] = value;
    return this.saveTokens();
  }

  async getToken(key) {
    return new Promise((resolve) => {
      resolve(this.keysCache[key]);
    });
  }

  saveTokens() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, JSON.stringify(this.keysCache), (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = FlatFileTokenStore;
