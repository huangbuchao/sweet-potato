const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, '/')
    },
    devServer: {
        quiet: true,
        host: '0.0.0.0',
        port: 8024
    },
    plugins: [new FriendlyErrorsPlugin()]
};
