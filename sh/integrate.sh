#!/bin/sh
REPOSDIR="/home/lana/repos/"
LOGSDIR="/home/lana/logs/"
TMPFILE="${LOGSDIR}TEMP"
LOGFILE="${LOGSDIR}$(date +%s)"
REPO=$1
BRANCH=$2
TEST=$3

cd $REPOSDIR$REPO
git fetch origin
git merge "origin/${BRANCH}" -X theirs

if [ "$TEST" = "true" ]
then
    npm test 2> $TMPFILE
    if [ ! -s $TMPFILE ]
    then
        cat $TMPFILE > $LOGFILE
        rm $TMPFILE
        exit 1
    fi
fi

docker build -t="${REPO}" .
docker save -o "${REPOSDIR}${REPO}.tar" "${REPO}"

exit 0
