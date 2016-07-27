const helper = require('./helpers');

function generatePresignedUrl(path, config) {
  const date = config.s3BasicAuthDateForTestSuite || new Date();
  const iso8601Date = helper.iso8601(date);
  const shortDate = helper.shortDate(date);

  // 1. StringToSign
  // ===============
  // a) CanonicalRequest
  const request = new Map([
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${config.key}/${shortDate}/us-east-1/s3/aws4_request`],
    ['X-Amz-Date', `${iso8601Date}`],
    ['X-Amz-Expires', `${config.expires}`],
    ['X-Amz-SignedHeaders', 'host'],
  ]);

  const canonicalRequest = `GET
/${path.replace(/'/g, '%27')}
${helper.convertMapToSearchQuery(request)}
host:${config.host}

host
UNSIGNED-PAYLOAD`;

  // b) StringToSign
  const stringToSign = `AWS4-HMAC-SHA256
${iso8601Date}
${shortDate}/us-east-1/s3/aws4_request
${helper.hash(canonicalRequest)}`;

  // 2. Signing key
  // ==============
  const dateKey = helper.hmac(`AWS4${config.secret}`, shortDate);
  const dateRegionKey = helper.hmac(dateKey, 'us-east-1');
  const dateRegionServiceKey = helper.hmac(dateRegionKey, 's3');
  const signingKey = helper.hmac(dateRegionServiceKey, 'aws4_request');

  // 3. Signature
  // ============
  const signature = helper.hmac(signingKey, stringToSign, 'hex');

  // 4. Presigned URL
  // ================
  return `https://${config.host}/${path}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${config.key}%2F${shortDate}%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=${iso8601Date}&X-Amz-Expires=${config.expires}&X-Amz-SignedHeaders=host&X-Amz-Signature=${signature}`;
}

module.exports = generatePresignedUrl;
