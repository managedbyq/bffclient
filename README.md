# BFF Client

## Usage

In an initialization file (e.g. `app.js`):

```javascript
const BffClientFactory = require('mbq.bffclient');

// either
store = new BffClientFactory.RedisTokenStore(process.env.REDIS_STORE_URL)
// or
store = new BffClientFactory.FlatFileTokenStore(process.env.TOKEN_FILE_PATH)

BffClientFactory.init({
  auth0Domain: process.env.AUTH0_DOMAIN,
  auth0Client: process.env.AUTH0_CLIENT,
  auth0Secret: process.env.AUTH0_SECRET,
  tokenStore: store,
});
```

In individual service files (e.g. `services/myservice.js`):

```javascript
const BffClientFactory = require('mbq.bffclient');

class MyService {
  constructor() {
    this.serviceClient = BffClientFactory.createServiceClient(
      'my-service',
      process.env.MY_SERVICE_API_URL,
      process.env.AUTH0_MY_SERVICE_API_ID,
    );
  }

  getWidgets(frobId) {
    return this.serviceClient.get(
      '/api/widgets',
      { query: { frob_id: frobId } }
    );
  }

  setFoo(barId) {
    return this.serviceClient.post(
        '/api/foo',
        {
            body: { bar_id: barId },
            headers: { baz: 'quux' }
        },
    );
  }
}

module.exports = new MyService();
```

To call:

```javascript
const myService = require('./services/myservice.js');

myService
    .getWidgets(1)
    .then(res => handleRes(res))
    .catch(err => handleErr(err));
```

Handles the following methods:

 - `.get(url, options)`
 - `.post(url, options)`
 - `.put(url, options)`
 - `.patch(url, options)`
 - `.delete(url, options)`

Where options takes:

 - `query` Query String Params ("GET" params)
 - `body` Request Body ("POST" params)
 - `headers` Headers (will override all others)
