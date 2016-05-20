#!/bin/bash
#=========================================================================================
#          FILE:  deploy-worker.sh
#         USAGE:  ./deploy-worker.sh
#
#  REQUIREMENTS:  pm2 (http://pm2.keymetrics.io/) must be installed on the local machine:
#                 npm install pm2 -g
#
#                 pm2, node.js and npm must be installed on the target machine.
#
#                 Target machine's identity file must be configured for SSH
#                 either through ~/.ssh/config or ssh-add. You may also
#                 edit this script and use `ssh -i /path/to/your/key $TARGET_HOST`.
#
#         NOTES:  Please use your own value for $TARGET_HOST variable.
#                 You may also setup other variables for your needs.
#
#   DESCRIPTION:  This script deploys background jobs worker app to target machine
#                 using pm2. You can also use pm2 to manage the worker app on
#                 the target machine. Please refer to pm2 docs for more information:
#                 http://pm2.keymetrics.io/docs/usage/quick-start/
#=========================================================================================

REPO_ROOT_PATH=$(cd `dirname $0`/..; pwd -P)
WORKER_PATH=$REPO_ROOT_PATH/src/channel.build.worker
TARGET_HOST=ubuntu@jobs.channel.build
TARGET_WORKER_PATH=/home/ubuntu/app/channel.build/source/src/channel.build.worker
ECOSYSTEM_NAME=chan-ecosystem.json
ENVIRONMENT=production

# Enable the aliases expansion.
# Define alias for remote shell command.
shopt -s expand_aliases
alias rsh="ssh $TARGET_HOST"

# Deploy the worker app code to the target machine with pm2.
# Use `pm2 deploy` only if this is the first deployment.
pushd $WORKER_PATH > /dev/null
rsh test -d $TARGET_WORKER_PATH || pm2 deploy $ECOSYSTEM_NAME $ENVIRONMENT setup
pm2 deploy $ECOSYSTEM_NAME $ENVIRONMENT
popd > /dev/null
