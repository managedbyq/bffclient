const assert = require('chai').assert;
const fs = require('fs');
const mockFs = require('mock-fs');

const FlatFileTokenStore = require('../stores/flatfiletokenstore.js');

const PATH = 'storage.txt';

describe('FlatFileTokenStore', () => {
  it('should store tokens', async () => {
    mockFs({
      PATH: '',
    });

    const ffts = new FlatFileTokenStore(PATH);
    await ffts.storeToken('key', 'TOKEN_VALUE');
    const token = await ffts.getToken('key');
    assert.strictEqual(token, 'TOKEN_VALUE');

    assert.include(fs.readFileSync(PATH).toString(), 'TOKEN_VALUE');

    mockFs.restore();
  });

  it('should detect when the file store changes', async () => {
    mockFs({
      PATH: '',
    });

    const ffts = new FlatFileTokenStore(PATH);
    await ffts.storeToken('key', 'TOKEN_VALUE');

    const ffts2 = new FlatFileTokenStore(PATH);
    await ffts2.storeToken('key', 'NEW_TOKEN_VALUE');

    const newToken = await ffts.getToken('key');
    assert.strictEqual(newToken, 'NEW_TOKEN_VALUE');

    await ffts.storeToken('key', 'NEWER_TOKEN_VALUE');

    const newerToken = await ffts2.getToken('key');
    assert.strictEqual(newerToken, 'NEWER_TOKEN_VALUE');

    mockFs.restore();
  });
});
