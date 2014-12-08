#!/bin/sh

REPO=$1
BRANCH=$2
TEST=$3
HOST="lana@$4"
LANGUAGE=$5

# Determine command to use to run unit tests
case "$LANGUAGE" in
    nodejs)
        TESTCMD="npm test"
        ;;
    clojure)
        TESTCMD="lein test"
        ;;
    go)
        TESTCMD="go test"
        ;;
    ruby)
        TESTCMD="rake test"
        ;;
    rust)
        TESTCMD="rustc --test *.rs"
        ;;
    *)
        echo "Unknown language: $LANGUAGE" >&2
        exit 1
        ;;
esac

# Execute remaining commands in project directory
REPODIR="/home/lana/repos/${REPO}/"
cd $REPODIR

# Fetch changes to project repository
git fetch origin
git checkout "$BRANCH"
git merge "origin/${BRANCH}" -X theirs

# Run unit tests if user passed "true" to test
LOGDIR="/home/lana/logs/${REPO}/"
TMPFILE="${LOGDIR}TEMP"
ERRFILE="${LOGDIR}ERR"
LOGFILE="${LOGDIR}$(date +%s)"

if [ "$TEST" = "true" ]
then
    $TESTCMD 1> $TMPFILE 2> $ERRFILE
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

# Build & save Docker image
LOCALIMGDIR="/home/lana/local-images/"
NAME=$(echo "$REPO" | sed -e 's/\//_/g')
IMGFILE="${NAME}.tar"
LOCALPATH="${LOCALIMGDIR}${IMGFILE}"

docker build -t="${NAME}" .
docker save -o "${LOCALPATH}" "${NAME}"

# Deploy Docker image to remote host
REMOTEIMGDIR="/home/lana/remote-images/"
REMOTEPATH="${REMOTEIMGDIR}${IMGFILE}"

scp "$LOCALPATH" "${HOST}:${REMOTEPATH}"

LOADCMD="docker load -i ${REMOTEPATH}"
ssh "${HOST}" "${LOADCMD}"

KILLCMD="docker kill ${NAME}"
ssh "${HOST}" "${KILLCMD}"

RUNCMD="docker run -d -name ${NAME} ${NAME}"
ssh "${HOST}" "${RUNCMD}"

exit 0
