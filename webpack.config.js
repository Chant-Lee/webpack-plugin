const path = require('path');
const MyWebpackPlugin = require('./webpack-plugin/index')
const MyAddOptionPlugin = require('./webpack-plugin/add-name')

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new MyWebpackPlugin(),
    
    new MyAddOptionPlugin({ name: 2222 })
  ]
};