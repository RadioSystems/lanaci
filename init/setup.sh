#!/bin/sh

# Add user
useradd -M -s /bin/false lanaci

# Give user non-sudo access to docker
gpasswd -a lanaci docker
service docker restart

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

# Make user lanaci owner of lanaci directory
LANACIPATH="$SCRIPTPATH/../"
chown -R lanaci "$LANACIPATH"

# Add SSH Keys
SSHPATH="$SCRIPTPATH/../conf/.ssh"
sudo -u lanaci ssh-keygen -t rsa -C "lanaci@example.com" -f "$SSHPATH/id_rsa"
sudo -u lanaci cat "$SSHPATH/id_rsa.pub"
echo "Add the previous line to the list of SSH keys for your git host account."

# Set correct permissions on SSH 
sudo -u lanaci chmod 600 "$SSHPATH/id_rsa" "$SSHPATH/id_rsa.pub"
