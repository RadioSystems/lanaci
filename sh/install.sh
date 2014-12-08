#!/bin/sh

GLOBALNODEMODULES="/usr/local/lib/node_modules/"

# Add user
useradd -m -s /bin/false -d /home/lana lana

# Give user non-sudo access to docker
gpasswd -a lana docker
service docker restart

# Create repos & logs directories
sudo -u lana mkdir /home/lana/repos
sudo -u lana mkdir /home/lana/logs
sudo -u lana mkdir /home/lana/local-images

# Add SSH Keys
sudo -u lana ssh-keygen -t rsa -C "lana@example.com"
sudo -u lana cat /home/lana/.ssh/id_rsa.pub
echo "Add the previous line to the list of SSH keys for your git host account."

# Give lana ownership of lana module directory
chown -R lana:lana "${GLOBALNODEMODULES}lana"
