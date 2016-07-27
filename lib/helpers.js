const crypto = require('crypto');

function hmac(secret, data, encoding) {
  const newHmac = crypto.createHmac('sha256', secret);
  newHmac.update(data, 'utf8');
  return newHmac.digest(encoding);
}

function hash(data) {
  const newHash = crypto.createHash('sha256');
  newHash.update(data);
  return newHash.digest('hex');
}

// Credit to https://git.department.se/department/aws-signature-v4
function iso8601(date) {
  return new Date(date).toISOString().replace(/[:\-]|\.\d{3}/g, '');
}

function shortDate(date) {
  return iso8601(date).substring(0, 8);
}

function convertMapToSearchQuery(requestMap) {
  let result = '';
  for (const [key, value] of requestMap) {
    result += `${key}=${encodeURIComponent(value)}&`;
  }

  return result.slice(0, -1);
}

module.exports = {
  hmac,
  hash,
  iso8601,
  shortDate,
  convertMapToSearchQuery,
};
