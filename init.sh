#!/bin/sh

# Add user
sudo useradd -m -s /bin/false -d /home/lana lana

# Give user non-sudo access to docker
sudo gpasswd -a lana docker
sudo service docker restart

# Create repos directory
sudo -u lana mkdir /home/lana/repos

# Add SSH Keys
sudo -u lana ssh-keygen -t rsa -C "lana@example.com"
sudo -u lana cat /home/lana/.ssh/id_rsa.pub
echo "Add the previous line to your the list of SSH keys for your git host account."

