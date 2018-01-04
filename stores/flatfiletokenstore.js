const fs = require('fs');

async function getFileLastModified(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        return reject(err);
      }
      resolve(stat.mtime);
    });
  });
}

async function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, contents) => {
      if (err) {
        return reject(err);
      }
      resolve(contents);
    });
  });
}

async function saveTokens(filePath, tokenCache) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(tokenCache), (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

class FlatFileTokenStore {
  constructor(filePath = './flatfilestorage') {
    this.filePath = filePath;
    this.fileLastModified = 0;

    try {
      this.tokenCache = JSON.parse(fs.readFileSync(filePath));
      this.fileLastModified = fs.statSync(filePath).mtime;
      if (!this.tokenCache) {
        this.tokenCache = {};
      }
    } catch (e) {
      this.tokenCache = {};
    }
  }

  async storeToken(serviceName, value) {
    this.tokenCache[serviceName] = value;
    try {
      await saveTokens(this.filePath, this.tokenCache);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getToken(serviceName) {
    const lastModified = await getFileLastModified(this.filePath);
    if (lastModified > this.fileLastModified) {
      this.fileLastModified = lastModified;
      try {
        this.tokenCache = JSON.parse(await readFileAsync(this.filePath));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.resolve(this.tokenCache[serviceName]);
  }
}

module.exports = FlatFileTokenStore;
