function intFromBytes( x ){
    var val = 0;
    for (var i = 0; i < x.length; ++i) {        
        val += x[i];        
        if (i < x.length-1) {
            val = val << 8;
        }
    }
    return val;
}

function toHex(str) {
  var hex = '';
  for(var i=0;i<str.length;i++) {
    hex += ''+str.charCodeAt(i).toString(16);
  }
  return hex;
}

function inicializar(){
  clearReg();
  printRssi("");
  var boton=document.getElementById("boton");
  boton.src="res/waiting.png";
  boton.onclick = function() {
	 return false;
  };
  
  var selectedKey=window.localStorage.getItem("key");
  var key = CryptoJS.enc.Base64.parse(selectedKey);
  var random;
  var digest;
  var rssi;

  var authorized = false;

  var TFGserviceUuid = "3939";
  var randomCharacteristicUuid = "3940";
  var writeCharacteristicUuid = "3941";
  var rssiCharacteristic = "3942";

  var rssiThreshold = 75;

  var scanTimer = null;
  var connectTimer = null;

  bluetoothle.initialize(initializeSuccess, initializeError);

  function initializeSuccess(obj)
  {
  	if (obj.status == "initialized")
  	{
  	  printInfo("Bluetooth iniciado correctamente, comenzando escaneo...");
  	  var paramsObj = {"serviceUuids":[TFGserviceUuid]};
  	  bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
  	}
  	else
  	{
  	  printInfo("Estado de conexión inesperado: " + obj.status);
  	}
  }

  function initializeError(obj)
  {
	   printInfo("Error al inicializar Bluetooth: " + obj.error + " - " + obj.message);
     boton.src="res/on.png";
      boton.onclick = function() {
        inicializar();
      };
  }

  function startScanSuccess(obj)
  {
  	if (obj.status == "scanResult")
  	{
  	  printInfo("Dispositivo encontrado. Parando escaneo.");
  	  bluetoothle.stopScan(stopScanSuccess, stopScanError);
  	  clearScanTimeout();
  	  printInfo("Nombre del dispositivo: " + obj.name+" - RSSI: " + obj.rssi);
  	  connectDevice(obj.address);
  	}
  	else if (obj.status == "scanStarted")
  	{
  	  printInfo("Escaneo comenzado correctamente, buscando durante 10s.");
  	  scanTimer = setTimeout(scanTimeout, 10000);
  	}
  	else
  	{
  	  printInfo("Inicio inesperado de escaneo: " + obj.status);
  	}
  }

  function startScanError(obj)
  {
	 printInfo("Error en el inicio de escaneo: " + obj.error + " - " + obj.message);
  }

  function scanTimeout()
  {
  	printInfo("Timeout expirado, deteniendo escaneo...");
  	bluetoothle.stopScan(stopScanSuccess, stopScanError);
    boton.src="res/on.png";
    boton.onclick = function() {
      inicializar();
    };
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
  	if (obj.status == "scanStopped")
  	{
  	  printInfo("Escaneo completado correctamente.");
  	}
  	else
  	{
  	  printInfo("Estado inesperado de escaneo: " + obj.status);
  	}
  }

  function stopScanError(obj)
  {
	 printInfo("Error al completar el escaneo: " + obj.error + " - " + obj.message);
  }

  function connectDevice(address)
  {
  	printInfo("Comenzando conexión a: " + address + " con 5 segundos de timeout");
  	var paramsObj = {"address":address};
  	bluetoothle.connect(connectSuccess, connectError, paramsObj);
  	connectTimer = setTimeout(connectTimeout, 5000);
  }

  function connectSuccess(obj)
  {
  	if (obj.status == "connected")
  	{
  	  printInfo("Conectado a: " + obj.name + " - " + obj.address);

  	  clearConnectTimeout();


      printInfo("Iniciando descubrimiento...");
      bluetoothle.discover(discoverSuccess, discoverError);
  	}
  	else if (obj.status == "connecting")
  	{
  	  printInfo("Conectando a: " + obj.name + " - " + obj.address);
  	}
  	  else
  	{
  	  printInfo("Estado inesperado de conexión: " + obj.status);
  	  clearConnectTimeout();
      tempDisconnectDevice();
  	}
  }

  function connectError(obj)
  {
  	printInfo("Error al conectar: " + obj.error + " - " + obj.message);
  	clearConnectTimeout();
  }

  function connectTimeout()
  {
	 printInfo("Timeout expirado");
  }

  function clearConnectTimeout()
  { 
	  //printInfo("Reiniciando connect timeout");
  	if (connectTimer != null)
  	{
  	  clearTimeout(connectTimer);
  	}
  }
/* INICIO PRUEBAS CON CARACTERÍSTICAS */

  function discoverSuccess(obj)
  {
    if (obj.status == "discovered")
    {
      printInfo("Descubrimiento completado");
      /*printInfo(JSON.stringify(obj));*/
      setTimeout(subscribeCharacteristic,1500);
    }
    else
    {
      printInfo("Estado inesperado de descubrimiento: " + obj.status);
      tempDisconnectDevice();
    }
  }

  function discoverError(obj)
  {
    printInfo("Error en el descubrimiento: " + obj.error + " - " + obj.message);
    tempDisconnectDevice();
  }

  function subscribeCharacteristic()
  {
    printInfo("Suscribiendose a protocolo de autenticación...");
    var paramsObj = {"serviceUuid":TFGserviceUuid, "characteristicUuid":randomCharacteristicUuid, "isNotification":true};
    bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
  }

  function subscribeSuccess(obj)
  {   
      if (obj.status == "subscribedResult")
      {
          printInfo("Dato recibido de la suscripción");

          //Parse array of int32 into uint8
          var bytes = bluetoothle.encodedStringToBytes(obj.value);
          random = intFromBytes(bytes);
          printInfo("Dato: " + random);
          var vector = CryptoJS.enc.Hex.parse('00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00');
          var encrypt = CryptoJS.AES.encrypt(random+"",key, {iv: vector});
          digest = encrypt.toString();
          unsubscribeDevice();
      }
      else if (obj.status == "subscribed")
      {
          printInfo("suscripción comenzada");
      }
      else
      {
        printInfo("Estado inesperado de suscripción: " + obj.status);
        tempDisconnectDevice();
      }
  }

  function subscribeError(obj)
  {
    printInfo("Subscribe error: " + obj.error + " - " + obj.message);
    tempDisconnectDevice();
  }

  function unsubscribeDevice()
  {
    printInfo("Cerrando suscripción...");
    var paramsObj = {"serviceUuid":TFGserviceUuid, "characteristicUuid":randomCharacteristicUuid};
    bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
  }

  function unsubscribeSuccess(obj)
  {
      if (obj.status == "unsubscribed")
      {
        printInfo("Suscripción terminada. Enviando credenciales...");
        setTimeout(sendCredentials,3000);
      }
      else
      {
        printInfo("Error inesperado al terminar suscripción: " + obj.status);
        tempDisconnectDevice();
      }
  }

  function unsubscribeError(obj)
  {
    printInfo("Error al terminar suscripción: " + obj.error + " - " + obj.message);
    tempDisconnectDevice();
  }

  function sendCredentials()
  {
    var paramsObj = {"value":bluetoothle.bytesToEncodedString(bluetoothle.stringToBytes(device.uuid+" "+digest.substring(0,3))),"serviceUuid":TFGserviceUuid,"characteristicUuid":writeCharacteristicUuid};
    bluetoothle.write(writeSuccessCallback, writeErrorCallback, paramsObj);
  }

  function writeSuccessCallback(obj)
  {
    if (obj.status == "written")
    {
      printInfo("Enviado "+bluetoothle.bytesToString(bluetoothle.encodedStringToBytes(obj.value)));
      setTimeout(subscribeRssi,1500);
    }
    else
    {
      printInfo("Estado inesperado al enviar dato: " + obj.status);
      tempDisconnectDevice();
    }
  }

  function writeErrorCallback(obj)
  {
    printInfo("Error al enviar dato: " + obj.error + " - " + obj.message);
    tempDisconnectDevice();
  }

  function subscribeRssi(){
    printInfo("Suscribiendose a protocolo de autenticación...");
    var paramsObj = {"serviceUuid":TFGserviceUuid, "characteristicUuid":rssiCharacteristic, "isNotification":true};
    bluetoothle.subscribe(subscribeRssiSuccess, subscribeRssiError, paramsObj);
  }

  function subscribeRssiSuccess(obj)
  {   
      if (obj.status == "subscribedResult")
      {
          //Parse array of int32 into uint8
          var bytes = bluetoothle.encodedStringToBytes(obj.value);
          rssi = intFromBytes(bytes);
          printRssi(rssi);
          if(rssi>rssiThreshold && authorized){
            printInfo("Dispositivo alejado, autenticación continua interumpida.");
            boton.src="res/closed.png";
            authorized = false;
            navigator.notification.vibrate(500);
            var mediaRes = new Media("/android_asset/www/res/alert.mp3",
            function onSuccess() {
                mediaRes.release();
            },
            function onError(e){
                console.log("error playing sound.");
            });
          mediaRes.play();
          }else if(rssi <= rssiThreshold && !authorized){
            boton.src="res/open.png";
            authorized = true;
          }
      }
      else if (obj.status == "subscribed")
      {
          printInfo("Recibiendo rssi...");
          boton.onclick = function() {
           navigator.notification.confirm('Si desconecta el dispositivo se bloqueará la sesión en PC. ¿Estás seguro?', function(buttonIndex){
            if(buttonIndex == 1){
              tempDisconnectDevice();
            }}, 'Desconectar', 'Si,No');
          };
      }
      else
      {
        printInfo("Estado inesperado de suscripción a rssi: " + obj.status);
        tempDisconnectDevice();
      }
  }

  function subscribeRssiError(obj)
  {
    printInfo("Subscribe error: " + obj.error + " - " + obj.message);
    tempDisconnectDevice();
  }


/* FIN PRUEBAS CON CARACTERÍSTICAS */

  function tempDisconnectDevice()
  {
  	printRssi("");
	  printInfo("Desconectando del dispositivo.");

    /*document.getElementsByClassName('boton')[0].style.display = "none";*/
	  bluetoothle.disconnect(tempDisconnectSuccess, tempDisconnectError);
  }

  function tempDisconnectSuccess(obj)
  {
	  if (obj.status == "disconnected")
	  {
		  printInfo("Fin de la conexión.");
      closeDevice();
	  }
	  else if (obj.status == "disconnecting")
	  {
		  printInfo("En proceso de desconexión...");
	  }
	  else
  	{
  	  printInfo("Estado inesperado de desconexión: " + obj.status);
      closeDevice();
  	}
  }

  function tempDisconnectError(obj)
  {
	  printInfo("Error al desconectar: " + obj.error + " - " + obj.message);
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
          printInfo("Conexión cerrada.");
          boton.src="res/on.png";
          boton.onclick = function() {
            inicializar();
          };
      }
      else
    {
      printInfo("Estado inesperado al cerrar conexión: " + obj.status);
    }
  }

  function closeError(obj)
  {
    printInfo("Error al cerrar conexión: " + obj.error + " - " + obj.message);
  }
}