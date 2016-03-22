REPO_ROOT_PATH=$(cd `dirname $0`/..; pwd -P)
KEY_PATH=$REPO_ROOT_PATH/secrets/channelbuild.pem
CLIENT_PATH=$REPO_ROOT_PATH/src/channel.build.tvui
TARGET_HOST=ubuntu@channel.build
TARGET_CLIENT_PATH=/home/ubuntu/app/channel.build.tvui

# Remote shell command and remote copy command.
alias rsh='ssh -i $KEY_PATH $TARGET_HOST'
alias rcpdir='scp -r -i $KEY_PATH'

pushd $CLIENT_PATH > /dev/null
rsh mkdir -p $TARGET_CLIENT_PATH
rsh rm -r $TARGET_CLIENT_PATH
rcpdir $CLIENT_PATH/dist $TARGET_HOST:$TARGET_CLIENT_PATH
rcpdir $CLIENT_PATH/public/tvml $TARGET_HOST:$TARGET_CLIENT_PATH
popd > /dev/null
