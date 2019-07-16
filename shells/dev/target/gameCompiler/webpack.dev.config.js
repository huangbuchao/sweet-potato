const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const baseConfig = require('./webpack.base.config');
const output = process.env.PEPPA_OUTPUT || `${process.cwd()}/../dist`;

module.exports = merge.smart(baseConfig, {
    mode: 'development',
    devServer: {
        compress: true,
        hot: true,
        quiet: true,
        port: 8092,
        host: '0.0.0.0',
        headers: {
            'Access-Control-Allow-Methods':
                'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Origin': '*'
        },
        watchOptions: {
            ignored: /node_modules/
        },
        contentBase: `${output}/unpacked`,
        disableHostCheck: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [
                                [
                                    require.resolve('babel-preset-env'),
                                    {
                                        targets: {
                                            electron: '1.7',
                                            ios: '10.3'
                                        }
                                    }
                                ]
                            ],
                            plugins: [
                                require.resolve(
                                    'babel-plugin-transform-class-properties'
                                )
                            ]
                        }
                    },
                    path.resolve(`${__dirname}/loader/cocos-script-loader`)
                ]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsWebpackPlugin()
    ]
});
