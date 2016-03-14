# TODO:
# - Setup Vagrant.
# - Test the script with Vagrant.

RUBY_VERSION=2.2.1
SHELL=bash

# Download the signature for RVM.
command curl -sSL https://rvm.io/mpapis.asc | gpg --import -

# Install RVM and Ruby.
curl -L https://get.rvm.io | bash -s stable --auto-dotfiles --autolibs=enable --ruby
echo source ~/.rvm/scripts/rvm > ~/.${SHELL}rc
rvm install ruby-${RUBY_VERSION}
rvm use ruby-${RUBY_VERSION}
gem install bundler

# Install ImageMagick.
apt-get install -y imagemagick

# Install MongoDB.
apt-get install -y mongodb-org

# Install youtube-dl.
curl https://yt-dl.org/downloads/2016.03.14/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl
