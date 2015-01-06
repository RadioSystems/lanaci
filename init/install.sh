#!/bin/sh

# Download the lanaci app
git clone https://github.com/radiosystems/lanaci.git $(pwd)/lanaci

# Optionally, call setup.sh
case "$1" in
    -n|--no-setup)
        exit 0
        ;;
    *)
        SCRIPT=$(readlink -f "$0")
        SCRIPTPATH=$(dirname "$SCRIPT")
        sudo $SCRIPTPATH/setup.sh
        ;;
esac
