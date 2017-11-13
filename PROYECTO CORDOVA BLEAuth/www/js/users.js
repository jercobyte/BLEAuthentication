function manageProfiles(){
	userList = window.localStorage.getItem("userList").split(" ");
	user=window.localStorage.getItem("user");
	var selector=document.getElementById("selector");
	var html="";
	for (var i=0;i<userList.length;i++){
		html+="<option value='"+userList[i]+"'";
		if(user && user==userList[i]){
			html+=" selected ";
		}
		html+=">"+userList[i]+"</option>";
	}
	selector.innerHTML=html;
	document.getElementById("main").setAttribute("status","hide");
  	document.getElementById("users").setAttribute("status","show");
}

function setUser(){
	document.getElementById("setUser").className = document.getElementById("setUser").className + " spin";
	var selector=document.getElementById("selector");
	var newUser=selector.options[selector.selectedIndex].text;
	if(newUser){
		window.localStorage.setItem("user",newUser);
		keys=window.window.localStorage.getItem("keyList").split(" ");
    	window.localStorage.setItem("key",keys[selector.selectedIndex]);
	}
	setTimeout(function(){
		document.getElementById("setUser").className = document.getElementById("setUser").className.replace
      ( /(?:^|\s)spin(?!\S)/g , '' );
  	},1500);
	
}

function deleteUser(){ //A modificar luego
	navigator.notification.confirm('Antes de eliminar el usuario se ha de eliminar de la base de datos en PC, ¿estás seguro de querer eliminarlo?', function(buttonIndex){
        if(buttonIndex == 1){
        	var userList = window.localStorage.getItem("userList");
			if(userList){
				userList = window.localStorage.getItem("userList").split(" ");
				var keyList = window.localStorage.getItem("keyList").split(" ");
				var selector=document.getElementById("selector");
				var user=selector.options[selector.selectedIndex].text;
				var newUserList = "";
				var newKeyList = "";
				for (var i=0;i<userList.length;i++){
					if(user!=userList[i]){
						if(newUserList==""){
							newUserList+=userList[i];
							newKeyList+=keyList[i];
						}else{
							newUserList+=" "+userList[i];
							newKeyList+=" "+keyList[i];
						}
					}
				}
				if(newUserList==""){
					newUserList="demo";
					newKeyList="sbcuLagiUMHVoO7OP8jiNUyHbQYZIu98k0/GNahOW6w=";
				}
				window.localStorage.setItem("userList",newUserList);
				window.localStorage.setItem("keyList",newKeyList);
				window.localStorage.setItem("user","demo");
                window.localStorage.setItem("key","sbcuLagiUMHVoO7OP8jiNUyHbQYZIu98k0/GNahOW6w=");
                manageProfiles();
			}
        }}, 'Eliminar usuario', 'Si,No');
}

function LimpiarStorage()
{
    window.localStorage.clear();
    console.log("%cRegistro borrado", "color:red;");
}

function anadirUsuario(){
	html="<div class=\"btnverde\" onclick=\"scanBLE()\"><i class=\"fa fa-search\" style=\"padding-right: 2px;\"></i>Escanear</div>"
	document.getElementById("usuariosContent").innerHTML=html;
}

function scanBLE(){
	html="<img style=\"width: 20%;\" src=\"res/ajax.gif\">";
	document.getElementById("usuariosContent").innerHTML=html;

	var scanTimer = null;
  	var connectTimer = null;

	var TFGserviceUuid = "3939";
  	var idCharacteristicUuid = "3943";

	bluetoothle.initialize(initializeSuccess, initializeError);


	function initializeSuccess(obj)
	  {
	  	if (obj.status == "initialized")
	  	{
	  	  var paramsObj = {"serviceUuids":[TFGserviceUuid]};
	  	  bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
	  	}
	  	else
	  	{
	  	  showError();
	  	}
	  }

	function initializeError(obj)
	  {
	  	   showError();
	  }

	function startScanSuccess(obj)
	{
		if (obj.status == "scanResult")
		{
		  bluetoothle.stopScan(stopScanSuccess, stopScanError);
		  clearScanTimeout();
		  connectDevice(obj.address);
		}
		else if (obj.status == "scanStarted")
		{
		  scanTimer = setTimeout(scanTimeout, 10000);
		}
		else
		{
		  showError();
		}
	}

	function startScanError(obj)
	{
	 showError();
	}

	function scanTimeout()
	{
	 showError();
	 bluetoothle.stopScan(stopScanSuccess, stopScanError);
	}

  	function clearScanTimeout()
  	{ 
	  //printInfo("Reiniciando timeout de escaneo.");
	  	if (scanTimer != null)
	  	{
	  	  clearTimeout(scanTimer);
	  	}
  	}

  	function stopScanSuccess(obj)
    {
  	}

  	function stopScanError(obj)
  	{
  	}

  	function connectDevice(address)
  	{
  		var paramsObj = {"address":address};
  		bluetoothle.connect(connectSuccess, connectError, paramsObj);
  		connectTimer = setTimeout(connectTimeout, 5000);
  	}

  	function connectSuccess(obj)
  	{
  		if (obj.status == "connected")
  		{
  		clearConnectTimeout();
      	bluetoothle.discover(discoverSuccess, discoverError);
  		}
  		else if (obj.status == "connecting")
  		{
  		}
  	  	else
  		{
  	  		showError();
  	  		clearConnectTimeout();
      		tempDisconnectDevice();
  		}
  	}

  	function connectError(obj)
  	{
  		clearConnectTimeout();
  	}

  	function connectTimeout()
  	{
	 	showError();
  	}

  	function clearConnectTimeout()
  	{ 
	  //printInfo("Reiniciando connect timeout");
  		if (connectTimer != null)
  		{
  	  	clearTimeout(connectTimer);
  		}
  	}

  	function discoverSuccess(obj)
  	{
	    if (obj.status == "discovered")
	    {
	      setTimeout(writeCharacteristic,2000);
	    }
	    else
	    {
	      showError();
	      tempDisconnectDevice();
	    }
  	}

  	function discoverError(obj)
  	{
	    showError();
	    tempDisconnectDevice();
  	}

  	function writeCharacteristic()
  	{
    	var paramsObj = {"value":bluetoothle.bytesToEncodedString(bluetoothle.stringToBytes(device.uuid)),"serviceUuid":TFGserviceUuid,"characteristicUuid":idCharacteristicUuid};
    	bluetoothle.write(writeSuccessCallback, writeErrorCallback, paramsObj);
  	}

  	function writeSuccessCallback(obj)
  	{
	    if (obj.status == "written")
	    {
	    	enableQR();
	    	tempDisconnectDevice();
	    }
	    else
	    {
	      showError();
	      tempDisconnectDevice();
	    }
  	}

  	function writeErrorCallback(obj)
  	{
    	showError();
    	tempDisconnectDevice();
  	}

  	function tempDisconnectDevice()
  	{
	  	bluetoothle.disconnect(tempDisconnectSuccess, tempDisconnectError);
  	}

  	function tempDisconnectSuccess(obj)
  	{
		  if (obj.status == "disconnected")
		  {
	      	closeDevice();
		  }
		  else if (obj.status == "disconnecting")
		  {
		  }
		  else
	  	  {
	      	closeDevice();
	  	  }
  	}

  	function tempDisconnectError(obj)
  	{
    	closeDevice();
  	}

  	function closeDevice()
  	{
    	bluetoothle.close(closeSuccess, closeError);
  	}

  	function closeSuccess(obj)
  	{
	      if (obj.status == "closed")
	      {
	      }
	      else
	      {
	      }
  	}

  	function closeError(obj)
  	{
  	}

  	function showError(){
	  html="<img style=\"width: 20%;\" src=\"res/error.png\">"
	  document.getElementById("usuariosContent").innerHTML=html;
	}
}

function enableQR(){
	html="<div class=\"btnverde\" onclick=\"scanQR()\"><i class=\"fa fa-camera\" style=\"padding-right: 2px;\"></i>Escanear QR</div>"
	document.getElementById("usuariosContent").innerHTML=html;
}

function scanQR(){
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			window.localStorage.setItem("temporaryKey", result.text);
			enableName();
		}, 
		function (error) {
			html="<img style=\"width: 20%;\" src=\"res/error.png\">"
	  		document.getElementById("usuariosContent").innerHTML=html;
		}
	);
}

function enableName(){
	html="Inserte un nombre para el perfil: <br><br>";
	html+="<input type=\"text\" id=\"profileName\" onkeyup=\"nospaces(this)\" />";
	html+="<div class=\"btnverde\" onclick=\"saveProfile()\"><i class=\"fa fa-check\" style=\"padding-right: 2px;\"></i>Guardar perfil</div>";
	document.getElementById("usuariosContent").innerHTML=html;
}

function saveProfile(){
	name = document.getElementById('profileName').value;
	var userList = window.localStorage.getItem("userList");
	var keyList = window.localStorage.getItem("keyList");
	var temporaryKey = window.localStorage.getItem("temporaryKey");
    if(userList){
        window.localStorage.setItem("userList", userList+" "+name);
        window.localStorage.setItem("keyList", keyList+" "+temporaryKey);
    }else{
    	window.localStorage.setItem("userList", name);
    	window.localStorage.setItem("keyList", temporaryKey);
    }
    userList = window.localStorage.getItem("userList").split(" ");
    var selector=document.getElementById("selector");
	var html="";
	for (var i=0;i<userList.length;i++){
		html+="<option value='"+i+"'>"+userList[i]+"</option>";
	}
	selector.innerHTML=html;

    html="<span class=\"font-weight: bold; color: green\">Perfil agregado correctamente</span>";
    document.getElementById("usuariosContent").innerHTML=html;

    setTimeout(clearUsuariosContent,3000);
}

function clearUsuariosContent(){
	html="";
	document.getElementById("usuariosContent").innerHTML=html;
}

function nospaces(t){
  if(t.value.match(/\s/g)){
    t.value=t.value.replace(/\s/g,'');
  }
}