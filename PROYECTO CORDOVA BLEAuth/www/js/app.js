function clearReg(){
	var registro=document.getElementById("registro");
	registro.value="";
}

function printInfo(info)
{
  var registro=document.getElementById("registro");
  if(registro.value!=""){
  	registro.value+="\n"+info;
  }else{
  	registro.value=info;
  }
  registro.scrollTop = registro.scrollHeight;
}

function printRssi(rssi)
{
	var rssiInfoDiv=document.getElementsByClassName('info')[0];
	if(rssi != ""){
		var rssiInfo=document.getElementById("rssiInfo");
		rssiInfo.value="rssi: -"+rssi+" dBm";
		rssiInfoDiv.style.visibility = "visible";
	}else{
		rssiInfoDiv.style.visibility = "hidden";
	}
	
}

function showInfo(){
	document.getElementById("main").setAttribute("status","hide");
  	document.getElementById("info").setAttribute("status","show");
}

function back(){
	document.getElementById("info").setAttribute("status","hide");
	document.getElementById("users").setAttribute("status","hide");
  	document.getElementById("main").setAttribute("status","show");
}
