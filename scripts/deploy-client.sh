#!/bin/bash
#=========================================================================================
#          FILE:  deploy-client.sh
#         USAGE:  ./deploy-client.sh [version]
#
#  REQUIREMENTS:  Target machine's identity file must be configured for SSH
#                 either through ~/.ssh/config or ssh-add. You may also
#                 edit this script and use `ssh -i /path/to/your/key $TARGET_HOST`.
#
#         NOTES:  Please use your own value for $TARGET_HOST variable.
#                 You may also setup other variables for your needs.
#
#   DESCRIPTION:  This script deploys TVML/TVJS code to target machine
#                 with Meteor app running. The Meteor app implements endpoints
#                 to access TVML/TVJS files with versioning support:
#
#                 /tvos/v{version}/{type}/{filepath}
#
#                 Where:
#                 {version}  - a version of the TVML/TVJS code which may be
#                              provided by this script. The default is 1.
#                 {type}     - either 'tvml' or 'tvjs'.
#                 {filepath} - path to the file.
#
#                 E.g.:
#                 /tvos/v1/tvml/root.tvml
#                 /tvos/v2/tvjs/app.js
#=========================================================================================

# Get the version parameter. The default is 1.
[[ -n $1 ]] && CLIENT_VERSION=v$1 || CLIENT_VERSION=v1

REPO_ROOT_PATH=$(cd `dirname $0`/..; pwd -P)
CLIENT_PATH=$REPO_ROOT_PATH/src/channel.build.tvui
TARGET_HOST=ubuntu@channel.build
TARGET_CLIENT_PATH=/home/ubuntu/app/channel.build.tvui/$CLIENT_VERSION

# Remote shell command and remote copy command.
alias rsh='ssh $TARGET_HOST'
alias rcpdir='scp -r'

# Create all necessary directories on the target machine,
# copy the TVML/TVJS code and build it.
pushd $CLIENT_PATH > /dev/null
npm install
rsh rm -rf $TARGET_CLIENT_PATH
rsh mkdir -p $TARGET_CLIENT_PATH/dist
rsh mkdir -p $TARGET_CLIENT_PATH/public/tvml
rcpdir $CLIENT_PATH/dist $TARGET_HOST:$TARGET_CLIENT_PATH
rcpdir $CLIENT_PATH/public/tvml $TARGET_HOST:$TARGET_CLIENT_PATH/public
popd > /dev/null
