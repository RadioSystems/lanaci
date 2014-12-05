#!/bin/sh

REPOSDIR="/home/lana/repos/"
REPO="$1"
URL="$2"

sudo -u lana git clone $URL $REPOSDIR$REPO

x=0
for i in $*
do
    if [ $x -gt 1 ]
    then
        sudo -u lana "cd $REPOSDIR$REPO && git checkout --track origin/$i" 
    fi
    x=$(($x+1))
done
