var mongodb = require('mongodb');
var db = {
	/*getUserKey: function (deviceid,callback){
	  var server = new mongodb.Server("127.0.0.1", 27017, {});
	  var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
	  dbTest.open(function (error, client) {
	    if (error) throw error;
	    var collection = new mongodb.Collection(client, 'users');
	    collection.findOne({'deviceid': deviceid},{fields: ['k']},function(err, docs) {
	      if (error) throw error;
	      var document = JSON.parse(JSON.stringify(docs));
	      dbTest.close();
	      callback(document.k);
	    });
	  });
	},*/
	getUserKeys: function (deviceid,callback){
	  var server = new mongodb.Server("127.0.0.1", 27017, {});
	  var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
	  dbTest.open(function (error, client) {
	    if (error) throw error;
	    var collection = new mongodb.Collection(client, 'users');
	    collection.find({'deviceid': deviceid},{fields: ['_id','k']}).toArray(function(err, docs) {
	      if (error) throw error;
	      var document = JSON.parse(JSON.stringify(docs));
	      dbTest.close();
	      callback(document);
	    });
	  });
	},
	newUser: function(user,device,callback){
	  var server = new mongodb.Server("127.0.0.1", 27017, {});
	  var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
	  dbTest.open(function (error, client) {
	    if (error) throw error;
	    var collection = new mongodb.Collection(client, 'users');
	    collection.insert({_id:user, deviceid:device},function(err, docs){
	    	if (error) throw error;
	    	callback(user);
	    });
	  });
	}
	/* Usar de este modo:
	getSystemUser("ae02a9b434646439",function(){
	  console.log(id);
	});*/
};
module.exports=db;
