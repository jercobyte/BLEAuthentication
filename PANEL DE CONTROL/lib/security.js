var crypto = require('crypto');
var security = {
	validateDigest: function(random,key,probe){
		var iv = new Buffer(16);
		iv.fill(0);
		var k = new Buffer(key, 'base64');
		var cipher = crypto.createCipheriv('aes-256-cbc', k, iv);
		cipher.update(random, 'utf8', 'base64');
		var encryptedRandom = cipher.final('base64');
		return encryptedRandom.substring(0,3) == probe;
	},
	generateKey: function(callback){
		crypto.randomBytes(32, function(ex, buf) {
		  if (ex) throw ex;
		  callback(buf.toString('base64'));
		});
	}
};
module.exports=security;