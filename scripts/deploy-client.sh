pushd `dirname $0`/..
git subtree push --prefix src/channel.build.tvos/client heroku master
popd
