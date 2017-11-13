function test(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://localhost:3000/qr', true);

	xhr.responseType = 'arraybuffer';

	xhr.onload = function(e) {
	  if (this.status == 200) {
	    var uInt8Array = new Uint8Array(this.response);
	    var i = uInt8Array.length;
	    var binaryString = new Array(i);
	    while (i--)
	    {
	      binaryString[i] = String.fromCharCode(uInt8Array[i]);
	    }
	    var data = binaryString.join('');

	    var base64 = window.btoa(data);

	    document.getElementById("qrcode").src="data:image/png;base64,"+base64;
	  }
	};

	xhr.send();
}

function contenido(panel){
	document.getElementById("content_main").innerHTML=document.getElementById(panel).innerHTML;
}

function anadirUsuario(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4) {
	    	var result=xhr.responseText;
	    	if(result=="true"){
	    		document.getElementById("content_main").innerHTML="<h2>El usuario ya se encuentra en la base de datos de la aplicación</h2>";
	    	}else{
	    		contenido('anadir');
	    	}
	    }
	}
	xhr.open('GET', 'http://localhost:3000/userindb', true);
	xhr.send(null);
}

function consultarUsuarioLogged(callback){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4) {
	    	var user=xhr.responseText;
	    	callback(user);
	    }
	}
	xhr.open('GET', 'http://localhost:3000/user', true);
	xhr.send(null);
}

function consultarUsuarios(){
	consultarUsuarioLogged(function(user){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		    if (xhr.readyState == 4) {
		    	var users=JSON.parse(xhr.responseText);
		    	var html="<div style=\"margin: auto;\"><div style=\"width: 50%;display: table-cell;padding: 20px;\"><h1>Usuarios</h1>";
		    	for( i=0; i<users.length;i++){
		    		html+="<img src=\"images/user.png\" width=\"5%\">"+users[i]._id+"<br><br>";
		    	}
		    	html+="</div>";
		    	html+="<div style=\"width: 50%;display: table-cell;padding: 20px;\"><h1>Device id</h1>";
		    	for( i=0; i<users.length;i++){
		    		html+=users[i].deviceid.substring(0,5)+"...";
		    		if(users[i]._id==user){
		    			html+="<span style=\"color: green; font-weight: bold; margin-left: 120px;\">CONECTADO</span>&nbsp;&nbsp;<a href=\"#\"><img src=\"images/delete.png\" width=\"5%\" onClick=\"deleteUser();\"></a><br><br>";
		    		}else{
		    			html+="<br><br>";
		    		}
		    	}
		    	html+="</div></div>";
		    	document.getElementById("content_main").innerHTML=html;
		    }
		}
		xhr.open('GET', 'http://localhost:3000/users', true);
		xhr.send(null);
	});
}


function deleteUser(){
	var r= confirm("Tenga en cuenta que borrar su usuario de la aplicación Bluetooth solo tendrá efecto en la autenticación la próxima vez que reinicie el PC. Tras esto, es recomendable eliminar dicho perfil también desde la aplicación móvil.");
	if(r){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		    if (xhr.readyState == 4) {
		    	var result=xhr.responseText;
		    	if(result=="ok"){
		    		consultarUsuarios();
		    	}
		    }
		}
		xhr.open('GET', 'http://localhost:3000/deleteCurrentUser', true);
		xhr.send(null);
	}
}