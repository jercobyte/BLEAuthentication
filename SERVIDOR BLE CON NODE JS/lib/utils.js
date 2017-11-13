var utils = {
	generateNewRandom: function(){
		return Math.floor((Math.random() * 100) + 1);
	},
	generateNewRandomString: function(){
		return Math.floor((Math.random() * 100) + 1).toString();
	},
	showNotification: function(user,msg){
		var sys = require('sys');
		var exec = require('child_process').exec;
		function puts(error, stdout, stderr) {sys.puts(stdout)}
		exec("sudo -u "+user+" DISPLAY=\":0.0\" notify-send 'Bluetooth Authentication' '"+msg+"'", puts);
	},
	hideNotifications: function(user){
		var sys = require('sys');
		var exec = require('child_process').exec;
		function puts(error, stdout, stderr) {sys.puts(stdout)}
		exec("sudo -u "+user+" DISPLAY=\":0.0\" killall notify-osd", puts);
	},
	getLoggedUser: function(callback){
		var sys = require('sys');
		var exec = require('child_process').exec;
		function puts(error, stdout, stderr) {
			callback(stdout); 
		}
		exec("who | cut -d' ' -f1 | sort | uniq | head -n 1 | tr -d \" \t\n\r\" ", puts);
	}
};
module.exports=utils;