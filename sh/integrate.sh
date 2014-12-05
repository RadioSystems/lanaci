#!/bin/sh
REPOSDIR="/home/lana/repos/"
LOGSDIR="/home/lana/logs/"
REPO=$1
BRANCH=$2
TEST=$3
TMPFILE="${LOGSDIR}${REPO}/TEMP"
ERRFILE="${LOGSDIR}${REPO}/ERR"
LOGFILE="${LOGSDIR}${REPO}/$(date +%s)"

cd $REPOSDIR$REPO
git fetch origin
git merge "origin/${BRANCH}" -X theirs


if [ "$TEST" = "true" ]
then
    npm test 1> $TMPFILE 2> $ERRFILE
    touch $TMPFILE
    touch $ERRFILE
    if [ ! -s $ERRFILE ]
    then
        cat $ERRFILE > $LOGFILE
        rm $TMPFILE
        rm $ERRFILE
        exit 1
    elif [ $? -neq 0 ]
    then
        cat $TMPFILE $ERRFILE > $LOGFILE
        rm $TMPFILE
        rm $ERRFILE
        exit 1
    else
        rm $TMPFILE
        rm $ERRFILE
    fi
fi

docker build -t="${REPO}" .
docker save -o "${REPOSDIR}${REPO}.tar" "${REPO}"

exit 0
