const path = require('path');
const merge = require('webpack-merge');
const ArchivePlugin = require('webpack-archive-plugin');
const CheckSumPlugin = require('./plugin/CheckSumPlugin');

const baseConfig = require('./webpack.base.config');

const cwd = process.cwd();
const { version } = require(`${cwd}/package.json`);
const output = process.env.PEPPA_OUTPUT || `${cwd}/../dist`;

module.exports = merge.smart(baseConfig, {
    mode: 'development',
    context: cwd,
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
                                            ios: '9.0'
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
        new CheckSumPlugin({
            outputFilename: 'CHECKSUMS',
            checksumPattern: 'hash *filename'
        }),
        new ArchivePlugin({
            format: 'zip',
            output: `${output}/${version}-build.${process.env.CI_JOB_ID ||
                Date.now()}`
        })
    ]
});
