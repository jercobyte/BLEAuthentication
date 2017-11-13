var qr = require('qr-image');  
var express = require('express');
var db = require('./lib/db');
var security = require('./lib/security');
var utils = require('./lib/utils');
var io = require('./lib/io');
var dirname = '/home/jercobyte/Escritorio/Control Panel/www';

var app = express();

app.use(express.static(dirname));

app.get('/qr', function(req, res) {
	var sys = require('sys');
	var exec = require('child_process').exec;
	function handler(error, stdout, stderr) {
		security.generateKey(function(key){
		  db.updateKey(stdout,key,function(){
		  	var code = qr.image(key, { type: 'png' });
		  	res.type('png');
		  	code.pipe(res);
		  });
		});
	}
	exec("who | cut -d' ' -f1 | sort | uniq | head -n 1 | tr -d \" \t\n\r\" ", handler);
});

app.get('/users',function(req,res){
	db.getUsers(function(doc){
		res.json(doc);
	});
});

app.get('/user',function(req,res){
	var sys = require('sys');
	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) {
		res.send(stdout);
	}
	exec("who | cut -d' ' -f1 | sort | uniq | head -n 1 | tr -d \" \t\n\r\" ", puts);
});

app.get('/userindb',function(req,res){
	var sys = require('sys');
	var exec = require('child_process').exec;
	function handler(error, stdout, stderr) {
		db.existsUser(stdout, function(result){
			res.send(result);
		});
	}
	exec("who | cut -d' ' -f1 | sort | uniq | head -n 1 | tr -d \" \t\n\r\" ", handler);
});

app.get('/deleteCurrentUser',function(req,res){
	var sys = require('sys');
	var exec = require('child_process').exec;
	function handler(error, stdout, stderr) {
		db.deleteUser(stdout, function(result){
			io.deleteUserFromTemplate(result,function(){
				res.send("ok");
			});
		});
	}
	exec("who | cut -d' ' -f1 | sort | uniq | head -n 1 | tr -d \" \t\n\r\" ", handler);
});

app.listen(3000);
