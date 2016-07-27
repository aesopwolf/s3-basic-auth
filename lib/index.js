const request = require('request');
const generatePresignedUrl = require('./generate-presigned-url');


function sendResponse(_req, res, next, method, url) {
  const req = _req;
  if (method === 'redirect') {
    res.redirect(302, url);
  } else if (method === 'proxy') {
    request(url).pipe(res);
  } else if (method === 'presignedUrl') {
    req.presignedUrl = url;
    next();
  } else {
    throw new Error(`s3-basic-auth: '${method}' is invalid.
  Try 'proxy', 'redirect', or 'presignedUrl'.`);
  }
}

function proto(config) {
  return function _s3BasicAuth(req, res, next) {
    // Encode basic auth string
    let auth = Buffer.from(config.credentials, 'ascii').toString('base64');
    auth = `Basic ${auth}`;

    // Send a success or failure
    if (req.get('Authorization') === auth) {
      const url = generatePresignedUrl(req.params.path, config);
      sendResponse(req, res, next, config.method, url);
    } else {
      res.append('WWW-Authenticate', 'Basic realm="User Visible Realm"');
      res.status(401).end();
    }
  };
}

function s3BasicAuth(config) {
  return proto(config);
}

module.exports = s3BasicAuth;
