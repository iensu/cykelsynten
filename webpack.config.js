const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    path.join(__dirname, './src/')
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, './public/'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2016']
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: []
};
