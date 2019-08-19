const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const DotenvPlugin = require('dotenv-webpack');

const PeppaPlugin = require('./plugin/PeppaPlugin');

const md5 = crypto.createHash('md5');
const cwd =
    '/Users/huangbuchao/webPrejects/sweet-potato/packages/sweet-potato-game';
const { name } = require(`${cwd}/package.json`);
const webpackConfigPath = `${cwd}/webpack.config.js`;
md5.update(name);
const hashPrefix = md5.digest('hex').substr(0, 8);

let entry,
    resolve = {};

if (fs.existsSync(webpackConfigPath)) {
    entry = require(webpackConfigPath).entry;
}

const output = `${cwd}/dist`;

const config = {
    entry,
    output: {
        filename: `[name].js`,
        publicPath: '',
        path: `${output}/dist`
    },
    resolve,
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: require.resolve(`file-loader`),
                        options: {
                            name: '[name].[ext]'
                        }
                    },
                    {
                        loader: require.resolve(`extract-loader`)
                    },
                    {
                        loader: require.resolve(`html-loader`),
                        options: {
                            interpolate: false,
                            root: '.',
                            attrs: false
                        }
                    }
                ]
            },
            {
                test: /\.(fire|prefab|anim)$/,
                use: [
                    {
                        loader: `${__dirname}/loader/cocos-asset-loader`
                    }
                ]
            },
            {
                test: /\.(labelatlas|fnt)$/,
                use: [
                    {
                        loader: `${__dirname}/loader/cocos-font-loader`
                    }
                ]
            },
            {
                test: /\.meta$/,
                use: [
                    {
                        loader: `${__dirname}/loader/cocos-meta-loader`
                    }
                ]
            },
            {
                test: /\.(atlas|mp3|wav|ogg|m4a|mp4|plist)$/,
                use: [
                    {
                        loader: `${__dirname}/loader/cocos-raw-asset-loader`,
                        options: {
                            name: `${name}/[path][name].[ext]`
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|bmp|jpeg)$/,
                use: [
                    {
                        loader: `${__dirname}/loader/cocos-texture-loader`,
                        options: {
                            name: `${name}/[path][name].[ext]`
                        }
                    }
                ]
            },
            {
                type: 'javascript/auto',
                test: /courseware\.json$/,
                loader: `${__dirname}/loader/peppa-courseware-loader`
            },
            {
                type: 'javascript/auto',
                test: /\.json$/,
                loader: `${__dirname}/loader/cocos-json-loader`,
                exclude: /courseware\.json/
            }
        ]
    },
    plugins: [
        new webpack.ExternalsPlugin('commonjs', [
            'electron',
            'fs',
            'path',
            /^agora-electron-sdk.*/
        ]),
        new PeppaPlugin({
            assetDirs: [
                `${cwd}/assets`,
                path.resolve(`${__dirname}/default-assets`)
            ],
            hashPrefix: hashPrefix,
            compressTexture: true
        }),
        new webpack.HashedModuleIdsPlugin({
            hashFunction: 'md5',
            hashDigest: 'hex',
            hashDigestLength: 16
        }),
        new DotenvPlugin({
            path: `${__dirname}/.env/${process.env.PEPPA_ENV || 'dev'}.env`
        })
    ]
};

module.exports = config;
