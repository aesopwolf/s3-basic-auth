var express = require('express');
var request = require('supertest');
var s3BasicAuth = require('..');

var presignedUrl = 'https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404'

describe('Middleware can redirect', function () {
  var app;

  beforeEach(function () {
    app = express();

    var protectedRedirect = s3BasicAuth({
      key: 'AKIAIOSFODNN7EXAMPLE',
      secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      host: 'examplebucket.s3.amazonaws.com',
      expires: 86400,
      credentials: 'foo:bar',
      method: 'redirect',
      s3BasicAuthDateForTestSuite: new Date("2013-05-24T00:00:00")
    })

    app.get('/:path', protectedRedirect);
  });

  it('a protected route asks for credentials if none are provided', function (done) {
    request(app)
      .get('/test.txt')
      .expect('WWW-authenticate', 'Basic realm="User Visible Realm"', done)
  });

  it('a protected route asks for credentials if the supplied one is invalid', function (done) {
    request(app)
      .get('/test.txt')
      .expect('WWW-authenticate', 'Basic realm="User Visible Realm"', done)
  });

  it('an authorized request returns a 302 redirect', function (done) {
    request(app)
      .get('/test.txt')
      .set('Authorization', 'Basic Zm9vOmJhcg==')
      .expect(302)
      .expect('Location', presignedUrl)
      .end(done)
  });
});

describe('Middleware can proxy', function () {
  var app;

  beforeEach(function () {
    app = express();

    var protectedProxy = s3BasicAuth({
      key: 'AKIAIOSFODNN7EXAMPLE',
      secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      host: 'examplebucket.s3.amazonaws.com',
      expires: 86400,
      credentials: 'foo:bar',
      method: 'proxy',
      s3BasicAuthDateForTestSuite: new Date("2013-05-24T00:00:00")
    })

    app.get('/:path', protectedProxy);
  });

  it('a protected route asks for credentials if none are provided', function (done) {
    request(app)
      .get('/test.txt')
      .expect('WWW-authenticate', 'Basic realm="User Visible Realm"', done)
  });

  it('a protected route asks for credentials if the supplied one is invalid', function (done) {
    request(app)
      .get('/test.txt')
      .expect('WWW-authenticate', 'Basic realm="User Visible Realm"', done)
  });

  // makes an actual http request over the real internet
  it('an authorized request proxies the s3 item', function (done) {
    request(app)
      .get('/test.txt')
      .set('Authorization', 'Basic Zm9vOmJhcg==')
      .expect('x-amz-request-id', /.*/, done)
  });
});

describe('Middleware can set req.signedUrl', function () {
  var app;

  beforeEach(function () {
    app = express();

    var protectedpresignedUrl = s3BasicAuth({
      key: 'AKIAIOSFODNN7EXAMPLE',
      secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      host: 'examplebucket.s3.amazonaws.com',
      expires: 86400,
      credentials: 'foo:bar',
      method: 'presignedUrl',
      s3BasicAuthDateForTestSuite: new Date("2013-05-24T00:00:00")
    })

    app.get('/:path', protectedpresignedUrl, function(req, res) {
      res.send(req.presignedUrl);
    });
  });

  it('a protected route asks for credentials if none are provided', function (done) {
    request(app)
      .get('/test.txt')
      .expect('WWW-authenticate', 'Basic realm="User Visible Realm"', done)
  });

  it('a protected route asks for credentials if the supplied one is invalid', function (done) {
    request(app)
      .get('/test.txt')
      .expect('WWW-authenticate', 'Basic realm="User Visible Realm"', done)
  });

  it('an authorized request sets req.signedUrl', function (done) {
    request(app)
      .get('/test.txt')
      .set('Authorization', 'Basic Zm9vOmJhcg==')
      .expect(presignedUrl)
      .end(done)
  });
});

describe('Middleware method options', function () {
  var app;

  beforeEach(function () {
    app = express();

    var protectedInvalid = s3BasicAuth({
      key: 'AKIAIOSFODNN7EXAMPLE',
      secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      host: 'examplebucket.s3.amazonaws.com',
      expires: 86400,
      credentials: 'foo:bar',
      method: 'invalid',
      s3BasicAuthDateForTestSuite: new Date("2013-05-24T00:00:00")
    })

    app.get('/:path', protectedInvalid, function(req, res) {
      res.send(req.signedUrl);
    });
  });

  it('doesn\'t support invalid value', function (done) {
    request(app)
      .get('/test.txt')
      .set('Authorization', 'Basic Zm9vOmJhcg==')
      .end(function(err, res) {
        if (err) return done(err);
        done();
      })
    });
});
