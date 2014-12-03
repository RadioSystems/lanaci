#!/bin/sh
sudo useradd -m -s /bin/false -d /home/lana lana
sudo gpasswd -a lana docker
sudo service docker restart
sudo -u lana mkdir /home/lana/repos
sudo -u lana ssh-keygen -t rsa -C "lana@example.com"
sudo -u lana cat /home/lana/.ssh/id_rsa.pub
echo "Add the previous line to your the list of SSH keys for your git host account."
