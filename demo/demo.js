var express = require('express');
var app = express();
var s3BasicAuth = require('..');

var protectedProxy = s3BasicAuth({
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  host: 'examplebucket.s3.amazonaws.com',
  expires: 10,
  credentials: 'foo:bar',
  method: 'proxy'
})

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

app.get('/proxy/:path', protectedProxy);
app.use('/redirect/:path', protectedRedirect);
app.get('/presignedUrl/:path', protectedpresignedUrl, function(req, res) {
  res.send(req.presignedUrl);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
