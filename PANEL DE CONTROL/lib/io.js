var fs = require('fs');
var filePath = '/etc/login.users.denied';
var io = {
	addUserToFile: function(userName, callback){
	  var alreadyOnFile = false;
	  fs.readFile(filePath,function (error,data){
	    var ReadData = data.toString();
	    var WriteData = "";
	    var position = ReadData.indexOf('\n');
	    var user = "";
	    while (position != -1) {
	      user = ReadData.substr(0,position);
	      WriteData += user + '\n';
	      if (user == userName) {
	         alreadyOnFile=true;
	      }
	      ReadData = ReadData.substr(position + 1);
	      position = ReadData.indexOf('\n');
	      if(position == -1 && ReadData!=""){
	        WriteData += ReadData + '\n';
	      }
	    }
	    if(!alreadyOnFile){
	      WriteData += userName + '\n';
	      fs.writeFile(filePath, WriteData, function(err) {
	        if(err){
	          console.log("Error: "+err);
	        }else{
	          callback();
	        }
	      });
	    }else{
	      callback();
	    }
	  });
	},
	addUserToTemplate: function(userName, callback){
	  var alreadyOnFile = false;
	  fs.readFile("/home/jercobyte/Escritorio/BLEAuth/monitor daemon/login.users.denied",function (error,data){
	    var ReadData = data.toString();
	    var WriteData = "";
	    var position = ReadData.indexOf('\n');
	    var user = "";
	    while (position != -1) {
	      user = ReadData.substr(0,position);
	      WriteData += user + '\n';
	      if (user == userName) {
	         alreadyOnFile=true;
	      }
	      ReadData = ReadData.substr(position + 1);
	      position = ReadData.indexOf('\n');
	      if(position == -1 && ReadData!=""){
	        WriteData += ReadData + '\n';
	      }
	    }
	    if(!alreadyOnFile){
	      WriteData += userName + '\n';
	      fs.writeFile("/home/jercobyte/Escritorio/BLEAuth/monitor daemon/login.users.denied", WriteData, function(err) {
	        if(err){
	          console.log("Error: "+err);
	        }else{
	          callback();
	        }
	      });
	    }else{
	      callback();
	    }
	  });
	},
	deleteUserFromFile: function(userName, callback){
	  fs.readFile(filePath,function (error,data){
	    var ReadData = data.toString();
	    var WriteData = "";
	    var position = ReadData.indexOf('\n');
	    var user = "";
	    while (position != -1) {
	      user = ReadData.substr(0,position);
	      if (user != userName) {
	         WriteData += user + '\n';
	      }
	      ReadData = ReadData.substr(position + 1);
	      position = ReadData.indexOf('\n');
	    }
	    fs.writeFile(filePath, WriteData, function(err) {
	      if(err){
	        console.log("Error: "+err);
	      }else{
	        callback();
	      }
	    });
	  });
	},
	deleteUserFromTemplate: function(userName, callback){
	  fs.readFile("/home/jercobyte/Escritorio/BLEAuth/monitor daemon/login.users.denied",function (error,data){
	    var ReadData = data.toString();
	    var WriteData = "";
	    var position = ReadData.indexOf('\n');
	    var user = "";
	    while (position != -1) {
	      user = ReadData.substr(0,position);
	      if (user != userName) {
	         WriteData += user + '\n';
	      }
	      ReadData = ReadData.substr(position + 1);
	      position = ReadData.indexOf('\n');
	    }
	    fs.writeFile("/home/jercobyte/Escritorio/BLEAuth/monitor daemon/login.users.denied", WriteData, function(err) {
	      if(err){
	        console.log("Error: "+err);
	      }else{
	        callback();
	      }
	    });
	  });
	}
};
module.exports=io;
