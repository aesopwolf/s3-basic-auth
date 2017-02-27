# S3 Basic Auth

Express middleware for adding Basic Authentication to an Amazon S3 Bucket

Requires Node.js v6.0.0 or greater

[![version](https://img.shields.io/npm/v/s3-basic-auth.svg?maxAge=2592000)](https://www.npmjs.com/package/s3-basic-auth)
[![codecov](https://codecov.io/gh/aesopwolf/s3-basic-auth/branch/master/graph/badge.svg)](https://codecov.io/gh/aesopwolf/s3-basic-auth)
[![travis](https://travis-ci.org/aesopwolf/s3-basic-auth.svg?branch=master)](https://travis-ci.org/aesopwolf/s3-basic-auth)

## Instructions

This middleware sits in front of an S3 bucket and wraps the bucket with Basic Authentication.

As such, it requires a small amount of setup.

**1. Setup S3**

Create an S3 Bucket and keep it private.

![image](https://cloud.githubusercontent.com/assets/6847633/17079094/de269018-50ba-11e6-8f8e-8c7379f15aa9.png)

Don't add a grantee for 'Everyone', that would defeat the purpose of this middleware.

![image](https://cloud.githubusercontent.com/assets/6847633/17079112/3d550b8c-50bb-11e6-9a3b-51ae17296f7a.png)

**2. Deploy an Express app with this middleware**

Here is an example Express app that will get you up and running.

```js
// server.js
var express = require('express');
var app = express();
var s3BasicAuth = require('s3-basic-auth');

var protectedProxy = s3BasicAuth({
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  host: 'examplebucket.s3.amazonaws.com',
  expires: 10, // seconds that the presigned URL is valid for
  credentials: 'foo:bar', // username:password
  method: 'proxy' // 'proxy', 'redirect', 'presignedUrl' are valid options
})

app.use('/:path', protectedProxy); // Important: the `:path` param is expected by the middleware

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

**3. Use it**

```sh
$ node server.js
$ open http://localhost:3000/test.txt
```

## More Demos

```js
var express = require('express');
var app = express();
var s3BasicAuth = require('s3-basic-auth');

var protectedRedirect = s3BasicAuth({
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  host: 'examplebucket.s3.amazonaws.com',
  expires: 10,
  credentials: 'foo:bar',
  method: 'redirect'
})

var protectedpresignedUrl = s3BasicAuth({
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  host: 'examplebucket.s3.amazonaws.com',
  expires: 86400,
  credentials: 'foo:bar',
  method: 'presignedUrl'
})

app.get('/', function(req, res) {
  res.redirect('/index.html');
})

app.use('/redirect/:path', protectedRedirect);
app.get('/presignedUrl/:path', protectedpresignedUrl, function(req, res) {
  res.send(req.presignedUrl); // `presignedUrl` is attached to the request object
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

```

If you are using the redirect option then you can setup your html files like so:

```html
<html>
  <head>
    <base href="http://myredirectserver.example.com">
  </head>
  <body>
    <img src="/kramer.jpg" />
    <a href="/page2.html">page 2</a>
  </body>
</html>
```

By using the `base` meta tag then after a user visits http://mypresignedUrlserver.example.com/
they will be able to browse the S3 bucket like a normal website.

## Related work and future work

Yegor Bugayenko has already built the [same proxy service in Java](https://github.com/yegor256/s3auth).
He even provides a free hosted service at http://www.s3auth.com/

Read more on his blog at http://www.yegor256.com/2014/04/21/s3-http-basic-auth.html

Eventually, I would like to convert this to an Amazon Lambda function using [Serverless](http://serverless.com/)

---

**PS** I love feedback, please email me or create a GitHub issue if you'd like me to change functionality or add new features.
