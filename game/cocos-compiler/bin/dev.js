#!/usr/bin/env node
const webpack = require("webpack");
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.dev.config');

const devServerOptions = Object.assign(
    {}, 
    webpackConfig.devServer,
    {
        stats: {
            colors: true
        }
    }
);

const { entry } = webpackConfig;
let key = 'main';

if (!entry[key]) {
    key = Object.keys(entry)[0];
    entry[key] = [
        entry[key]
    ];
}

entry[key].unshift(
    'webpack/hot/dev-server',
    `webpack-dev-server/client?http://localhost:${ devServerOptions.port }/`
);

const compiler = webpack(webpackConfig);
const webpackDevServer = new WebpackDevServer(compiler, devServerOptions);

webpackDevServer.listen(
    devServerOptions.port,
    devServerOptions.host,
    () => console.log(`Starting server on http://localhost:${ devServerOptions.port }`)
);