const webpack = require('webpack');

module.exports = {
  entry: [
    './src/'
  ],
  output: {
    filename: 'bundle.js',
    path: './public/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
};
