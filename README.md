# BFF Client

## Usage

In an initialization file (e.g. `app.js`):

```javascript
const BffClientFactory = require('mbq.bffclient');

// either
store = new BffClientFactory.stores.RedisTokenStore(process.env.REDIS_STORE_URL)
// or
store = new BffClientFactory.stores.FlatFileTokenStore(process.env.TOKEN_FILE_PATH)

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

module.exports = new MyService(); // see "Refreshing Tokens" section for note
```

To call:

```javascript
const myService = require('./services/myservice');

try {
  const res = await myService.getWidgets(1);
  handleWidget(res.data.widgets[0]);
} catch (e) {
  handleError(e);
}
```

Handles the following methods:

 - `.get(url, options)`
 - `.post(url, options)`
 - `.put(url, options)`
 - `.patch(url, options)`
 - `.delete(url, options)`

Where options takes:

 - `params` Query String Params ("GET" params)
 - `data` Request Body ("POST" params)
 - `headers` Headers (will override all others)

 The result of these methods will be a [promise-wrapped Axios response](https://www.npmjs.com/package/axios#response-schema).

## Refreshing Tokens


If you want, you can have the services refresh themselves using javascript (this has issues in a case where you have more than one client running at once). The following example would refresh the token every two hours.

```javascript
BffClientFactory.createServiceClient(
  'my-service',
  process.env.MY_SERVICE_API_URL,
  process.env.AUTH0_MY_SERVICE_API_ID,
  1000 * 60 * 60 * 2
);
```

In the case that you want a cron to refresh your tokens (recommended), you should create an `index.js` in the folder of your services:

```
app
  services
    index.js
    service1.js
    service2.js
    myservice.js
```

In each of the services, return the constructor instead of a created instance:

```javascript
// module.exports = new MyService();
module.exports = MyService();
```

In the index.js, aggregate and return the instanciated services there:

```javascript
const Service1 = require('./service1');
const Service2 = require('./service2');
const MyService = require('./myservice.js');

module.exports = {
  service1: new Service1(),
  service2: new Service2(),
  myService: new MyService();
}
```

Import the services from the index instead of their files directly:

```javascript
// const myService = require('./services/myService');
const myService = require('./services').myService;
```

Then, you can write a script that refreshes the tokens of all services, and call that from a cron:

```javascript
const BffClientFactory = require('@mbq/bffclient');

BffClientFactory.init({
  auth0Domain: process.env.AUTH0_DOMAIN,
  auth0Client: process.env.AUTH0_CLIENT,
  auth0Secret: process.env.AUTH0_SECRET,
  tokenStore: new BffClientFactory.stores.RedisTokenStore(process.env.REDIS_STORE_URL),
});

const services = require('../src/server/services');
const actions = [];

for (let store of Object.keys(services)) {
  actions.push(services[store].serviceClient.refreshToken);
}

Promise.all(actions)
  .catch(e => {
    console.log(e);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  })

```
