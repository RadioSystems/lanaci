#!/bin/sh

CWD=$(pwd)
LANACIPATH="$CWD/lanaci"
NODE_ENV=production

# Download the lanaci app
git clone https://github.com/radiosystems/lanaci.git "$LANACIPATH"

# Install node_modules
cd "$LANACIPATH" && npm install

# Make symbolic link to bin/lanactl
mkdir -p "$CWD/bin"
ln -s "LANACIPATH/bin/lanactl" "$CWD/bin/lanactl"

# Optionally, call setup.sh
case "$1" in
    -n|--no-setup)
        exit 0
        ;;
    *)
        sudo "$LANACIPATH/init/setup-after-install.sh"
        ;;
esac
