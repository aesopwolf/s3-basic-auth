var expect = require('chai').expect;
var s3BasicAuth = require('../lib');
var generatePresignedUrl = require('../lib/generate-presigned-url.js');
var helper = require('../lib/helpers');

// Values from http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
var config = {
  key: 'AKIAIOSFODNN7EXAMPLE',
  secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  host: 'examplebucket.s3.amazonaws.com',
  expires: 86400,
  s3BasicAuthDateForTestSuite: new Date("2013-05-24T00:00:00")
};

// cream of the crop
describe('generate-presigned-url function', function() {
  it('should generate a presigned url', function() {
    var url = generatePresignedUrl('test.txt', config);
    expect(url).to.equal('https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404');
  })
})

// just a few utilities
describe('helper functions', function() {
  var shortDate = helper.shortDate(config.s3BasicAuthDateForTestSuite);
  var iso8601 = helper.iso8601(config.s3BasicAuthDateForTestSuite);

  it('should generate an hmac', function() {
    var hmac = helper.hmac("AWS4" + config.secret, shortDate).toString('hex');
    expect(hmac).to.equal('68896419206d6240ad4cd7dc8ba658efbf3b43b53041950083a10833824fcfbb');
  })

  it('should generate a hash', function() {
    var canonicalRequest = `GET
/test.txt
X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${config.key}%2F${shortDate}%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=${iso8601}&X-Amz-Expires=${config.expires}&X-Amz-SignedHeaders=host
host:${config.host}

host
UNSIGNED-PAYLOAD`;

    var hash = helper.hash(canonicalRequest);
    expect(hash).to.equal('3bfa292879f6447bbcda7001decf97f4a54dc650c8942174ae0a9121cf58ad04');
  })

  it('should generate a short date', function() {
    var shortDate = helper.shortDate(config.s3BasicAuthDateForTestSuite);
    expect(shortDate).to.equal('20130524');
  })

  it('should generate an ISO 8601 date', function() {
    var iso8601 = helper.iso8601(config.s3BasicAuthDateForTestSuite);
    expect(iso8601).to.equal('20130524T000000Z');
  })
})
