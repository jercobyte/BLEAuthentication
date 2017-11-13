#!/bin/bash
cp /home/jercobyte/Escritorio/BLEAuth/monitor\ daemon/login.users.denied /etc/ #/home/jercobyte/Escritorio/
while true ; do
    LOGGED="$(who -q | head -n 1)"
    for usuario in $LOGGED
    do
      grep $usuario /etc/login.users.denied -q #/home/jercobyte/Escritorio/login.users.allowed
      if [ $? -eq 0 ] ; then
        #echo 'Desconexión del usuario...'
	su - $usuario -c "export DISPLAY=:0; gnome-screensaver; gnome-screensaver-command -l;"
        disc=$usuario
        iterate=true
        while $iterate ; do
          grep $disc /etc/login.users.denied -q #/home/jercobyte/Escritorio/login.users.allowed
          if [ $? != 0 ] ; then
            #echo 'El usuario se ha vuelto a conectar'
	    su - $disc -c "export DISPLAY=:0; gnome-screensaver; gnome-screensaver-command -d;"
            iterate=false
          fi
          sleep 1
        done
      fi
      sleep 1
    done
done
