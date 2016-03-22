REPO_ROOT_PATH=$(cd `dirname $0`/..; pwd -P)
KEY_PATH=$REPO_ROOT_PATH/secrets/channelbuild.pem
WORKER_PATH=$REPO_ROOT_PATH/src/channel.build.worker
TARGET_HOST=ubuntu@jobs.channel.build
TARGET_WORKER_PATH=/home/ubuntu/app/channel.build/source/src/channel.build.worker
ECOSYSTEM_NAME=chan-ecosystem.json
ENVIRONMENT=production

# Remote shell command.
alias rsh='ssh -i $KEY_PATH $TARGET_HOST'

pushd $WORKER_PATH > /dev/null
rsh test -d $TARGET_WORKER_PATH || pm2 deploy $ECOSYSTEM_NAME $ENVIRONMENT setup
pm2 deploy $ECOSYSTEM_NAME $ENVIRONMENT
popd > /dev/null
