#!/bin/sh

# Add user
useradd -M -s /bin/false lanaci

# Give user non-sudo access to docker
gpasswd -a lanaci docker
service docker restart

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

# Make user lanaci owner of lanaci directory
LANACIPATH="$SCRIPTPATH/../.."
chown -R lanaci "$LANACIPATH/lanaci"

# Add SSH Keys
SSHPATH="$SCRIPTPATH/../conf/.ssh"
sudo -u lanaci ssh-keygen -t rsa -C "lanaci@example.com" -f "$SSHPATH/id_rsa"
sudo -u lanaci cat "$SSHPATH/id_rsa.pub"
echo "Add the previous line to the list of SSH keys for your git host account."

# Set correct permissions on SSH 
sudo -u lanaci chmod 600 "$SSHPATH/id_rsa" "$SSHPATH/id_rsa.pub"

# Setup either Upstart or SystemD
command -v lsb_release >/dev/null 2>&1
if [ "$?" = "0" ] && [ $(lsb_release -is) = "Ubuntu" ] && [ $(lsb_release -cs) = "trusty" ]
then
    cp "$SCRIPTPATH/lanaci.conf" /etc/init/lanaci.conf
elif [ -d "/etc/systemd/system" ]
then
    echo "$SCRIPTPATH/lanaci.service" /etc/systemd/system/lanaci.service 
elif [ -d "/run/systemd/system" ]
then
    echo "$SCRIPTPATH/lanaci.service" /run/systemd/system/lanaci.service 
elif [ -d "/usr/lib/systemd/system" ]
then
    echo "$SCRIPTPATH/lanaci.service" /usr/lib/systemd/system/lanaci.service 
else 
    echo "If you want to run lanaci as a daemon, you must configure it manually!" > /dev/stderr
fi

