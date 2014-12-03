#!/bin/sh
sudo useradd -m -s /bin/false -d /home/lana lana
sudo gpasswd -a lana docker
sudo service docker restart
sudo -u lana mkdir /home/lana/repos
