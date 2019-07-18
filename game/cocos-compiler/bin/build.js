#!/usr/bin/env node
const webpack = require("webpack");
const webpackConfig = require('../webpack.prod.config');

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
    if (err) {
        console.error(err.stack || err);
        if (err.details) {
            console.error(err.details);
        }

        process.exit(1);
        return;
    }

    console.log(stats.toString({
        chunks: false,
        colors: true
    }));

    if (stats.hasErrors()) {
        process.exit(1);
    }
});