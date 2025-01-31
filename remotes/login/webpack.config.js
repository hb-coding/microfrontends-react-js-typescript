const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const deps = require('./package.json').dependencies

module.exports = {
  entry: './src/index',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3004,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
    }
  },
  output: {
    filename: 'remote-login.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3004/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote_login',
      library: { type: 'var', name: 'remote_login' },
      filename: 'remote.js',
      exposes: {
        './Application': './src/_app',
      },
      shared: {
        'react': {
          singleton: true,
          requiredVersion: deps['react'],
        },
        'react-cookie': {
          singleton: true,
          requiredVersion: deps['react-cookie'],
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },

      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
