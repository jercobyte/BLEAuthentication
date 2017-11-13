var mongodb = require('mongodb');
var db = {
	getUserKey: function (deviceid,callback){
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
	},
	getSystemUser: function (deviceid, callback){
	  var server = new mongodb.Server("127.0.0.1", 27017, {});
	  var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
	  dbTest.open(function (error, client) {
	    if (error) throw error;
	    var collection = new mongodb.Collection(client, 'users');
	    collection.findOne({'deviceid': deviceid},{fields: ['_id']},function(err, docs) {
	      if (error) throw error;
	      var document = JSON.parse(JSON.stringify(docs));
	      dbTest.close();
	      callback(document._id);
	    });
	  });
	},
	getUsers: function(callback){
		var server = new mongodb.Server("127.0.0.1", 27017, {});
	  	var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
		 dbTest.open(function (error, client) {
		   if (error) throw error;
		   var collection = new mongodb.Collection(client, 'users');
		   collection.find().toArray(function(err, items) {
		   	if (error) throw error;
		     var document = JSON.parse(JSON.stringify(items));
		     dbTest.close();
		     callback(document);
		   });
		 });
	},
	existsUser: function(user,callback){
		var server = new mongodb.Server("127.0.0.1", 27017, {});
	  	var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
		 dbTest.open(function (error, client) {
		   	if (error) throw error;
		    var collection = new mongodb.Collection(client, 'users');
		    collection.findOne({'_id': user},{fields: ['_id']},function(err, docs) {
		      if (error) throw error;
		      if(docs){
		      	dbTest.close();
		      	callback(true);
		      }else{
		      	dbTest.close();
		      	callback(false);
		      }
		    });
		 });
	},
	updateKey: function(user,key,callback){
		var server = new mongodb.Server("127.0.0.1", 27017, {});
	  	var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
		 dbTest.open(function (error, client) {
		   	if (error) throw error;
		    var collection = new mongodb.Collection(client, 'users');
		    collection.findOne({'_id': user},{fields: ['_id','deviceid']},function(err, docs) {
		      if (error) throw error;
		      if(docs){
		      	var document = JSON.parse(JSON.stringify(docs));
		      	collection.update({_id:user}, {deviceid:document.deviceid,k:key}, function(err, docs){
					if (error) throw error;
					dbTest.close();
					callback();
			    });
		      }
		    });
		 });
	},
	deleteUser: function(user,callback){
		var server = new mongodb.Server("127.0.0.1", 27017, {});
	  	var dbTest = new mongodb.Db('TFGdb', server, {safe: true})
	 
		 dbTest.open(function (error, client) {
		   	if (error) throw error;
		    var collection = new mongodb.Collection(client, 'users');
		    collection.remove({'_id': user},function(err, numberOfRemovedDocs) {
		      if (error) throw error;
		      dbTest.close();
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
