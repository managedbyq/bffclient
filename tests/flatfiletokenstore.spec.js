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
    assert.equal(token, 'TOKEN_VALUE');

    assert.include(fs.readFileSync(PATH).toString(), 'TOKEN_VALUE');

    mockFs.restore();
  });
});
