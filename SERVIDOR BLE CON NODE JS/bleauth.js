var util = require('util'); //funciones útiles para bleno
var bleno = require('bleno'); //bleno
var utils = require('./lib/utils'); //funciones útiles
var db = require('./lib/db'); //funciones de acceso/modificación de MongoDB
var security = require('./lib/security'); //cifrado
var io = require('./lib/io'); //funciones de entrada salida con el fichero PAM

var Characteristic = bleno.Characteristic;
var BlenoPrimaryService = bleno.PrimaryService;

var rssiThreshold = -60; //umbral para el rssi, ha de ser igual en cliente y servidor
var rssiLimit = -75; //límite para el rssi, ha de ser igual en cliente y servidor 

var R; //random
var id; //id del dispositivo
var user=""; //usuario de Ubuntu
var signal = 0; //señal rssi
var authorized = false; //boolean para saber si el móvil está autorizado en todo momento
var sendable = false; //booleano para indicar al móvil cuándo está autenticado (en verde)

var notify = new Characteristic({
    uuid: '0000394000001000800000805f9b34fb', // or 'fff1' for 16-bit
    properties: ['notify'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
    onSubscribe: function(maxValueSize, updateValueCallback) {
      console.log('NotifyOnlyCharacteristic subscribe');

      this.counter = utils.generateNewRandom();
      R = this.counter;
      this.changeInterval = setInterval(function() {
        var data = new Buffer(4);
        data.writeUInt32BE(this.counter, 0);

        console.log('NotifyOnlyCharacteristic update value: ' + this.counter);
        updateValueCallback(data);
      }.bind(this), 2000);
    }, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: function() {
      console.log('NotifyOnlyCharacteristic unsubscribe');

      if (this.changeInterval) {
        clearInterval(this.changeInterval);
        this.changeInterval = null;
      }
    }, // optional notify unsubscribe handler, function() { ...}
    onNotify: function() {
      console.log('NotifyOnlyCharacteristic on notify');
    }
});

var write = new Characteristic({
    uuid: '0000394100001000800000805f9b34fb', // or 'fff1' for 16-bit
    properties: ['write'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
    onWriteRequest: function(data, offset, withoutResponse, callback) {
      console.log('WriteOnlyCharacteristic write request: ' + data + ' ' + offset + ' ' + withoutResponse);
      var info = data.toString().split(" ");
      id = info[0];
      var digest = info[1];
      console.log("Id del dispositivo: "+id);
      console.log("Digest: "+digest);
      db.getUserKeys(id,function(docs){
        var match = false;
        var i = 0;
        while(i<docs.length && !match){
          if(security.validateDigest(R+"",docs[i].k.toString(),digest)){
            match = true;
            user=docs[i]._id;
            console.log("Nuevo usuario conectado: "+user);
            io.deleteUserFromFile(user,function(){
              console.log("Comenzando autenticación continua...");
              authorized=true;
              checkRssi();
            });
          }
          i++;
        }
      });
      callback(this.RESULT_SUCCESS);
    } // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
});

var checker = new Characteristic({
    uuid: '0000394200001000800000805f9b34fb', // or 'fff1' for 16-bit
    properties: ['notify'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
    onSubscribe: function(maxValueSize, updateValueCallback) {
        console.log('NotifyOnlyCharacteristic subscribe');
        this.changeInterval = setInterval(function() {
          if(authorized || sendable){
            sendable=true;
            var data = new Buffer(4);
            data.writeUInt32BE(this.counter, 0);

            console.log('NotifyOnlyCharacteristic update value: ' + (-this.counter));
            updateValueCallback(data);
          }
        }.bind(this), 1000);
    }, // optional notify subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: function() {
      console.log('NotifyOnlyCharacteristic unsubscribe');

      if (this.changeInterval) {
        clearInterval(this.changeInterval);
        this.changeInterval = null;
      }
    }, // optional notify unsubscribe handler, function() { ...}
    onNotify: function() {
      console.log('NotifyOnlyCharacteristic on notify');
    }
});

var newUser = new Characteristic({
    uuid: '0000394300001000800000805f9b34fb', // or 'fff1' for 16-bit
    properties: ['write'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify'
    onWriteRequest: function(data, offset, withoutResponse, callback) {
      console.log('Añadiendo nuevo usuario al sistema: ' + data);
      var deviceid = data.toString();
      utils.getLoggedUser(function(systemUser){
        db.newUser(systemUser,deviceid,function(user){
          io.addUserToTemplate(user,function(){
            console.log("Usuario añadido correctamente");
          });
        });
      });
      callback(this.RESULT_SUCCESS);
    } // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
});

function SampleService() {
  SampleService.super_.call(this, {
    uuid: '0000393900001000800000805f9b34fb',
    characteristics: [
      notify,
      write,
      checker,
      newUser
    ]
  });
}

util.inherits(SampleService, BlenoPrimaryService);

bleno.on('stateChange', function(state) {
  console.log('Nuevo estado de conexión: ' + state);
  if (state === 'poweredOn') {
    bleno.startAdvertising('Bleauth', ['3939']);
  } else {
    bleno.stopAdvertising();
  }
});

// Linux only events /////////////////
bleno.on('accept', function() {
  console.log('Dispositivo conectado');
});

bleno.on('disconnect', function() {
  console.log('Dispositivo desconectado');
  authorized=false;
  if(user != ""){ //
    io.addUserToFile(user,function(){
      user = "";
      signal = 0;
      sendable = false;
      clearInterval(notify.changeInterval);
      notify.changeInterval = null;
      clearInterval(checker.changeInterval);
      checker.changeInterval = null;
      bleno.stopAdvertising();
      bleno.startAdvertising('Bleauth', ['3939']);
    });
  }else{
    clearInterval(notify.changeInterval);
    notify.changeInterval = null;
    clearInterval(checker.changeInterval);
    checker.changeInterval = null;
    bleno.stopAdvertising();
    bleno.startAdvertising('Bleauth', ['3939']);
  }
});

bleno.on('rssiUpdate', function(rssi) {
  signal=-rssi;
  this.counter = signal;
  if(rssi<rssiLimit){
    console.log('Dispositivo alejándose, desconexión inminente...');
    authorized=false;
    io.addUserToFile(user,function(){
      setTimeout(checkRssi,10000);
    }); //
  }else if(!authorized){
    authorized=true;
    io.deleteUserFromFile(user,function(){ //
      setTimeout(checkRssi,10000);
    });
  }else{
    setTimeout(checkRssi,750);
  }
  if(rssi<rssiThreshold && rssi>=rssiLimit){
    utils.hideNotifications(user);
    utils.showNotification(user,"Acérquese o se procederá a desconectar...");
  }
  /*console.log('rssiUpdate: ' + rssi);*/
}.bind(checker));
//////////////////////////////////////

bleno.on('advertisingStart', function(error) {
  console.log('Iniciando advertising: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new SampleService()
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('Finalizado advertising');
});

bleno.on('servicesSet', function() {
  console.log('Servicios BLE iniciados');
});

function checkRssi(){
  bleno.updateRssi();
}