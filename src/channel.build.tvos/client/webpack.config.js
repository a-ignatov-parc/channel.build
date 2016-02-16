const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: "./js/app.js"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  }
};
