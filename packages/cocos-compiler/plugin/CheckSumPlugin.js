const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const RawSource = require("webpack-sources").RawSource;

const PLUGIN_NAME = 'CheckSumPlugin';

function ChecksumPlugin(options) {
    this.options = options;
}

ChecksumPlugin.prototype.apply = function (compiler) {
    const options = this.options;
    const checksumPattern = options.checksumPattern || 'hash:filename';
    const outputFilename = options.outputFilename || 'CHECKSUMS';
    const outputPath = path.resolve(compiler.options.output.path, outputFilename);
    // Setup callback for accessing a compilation:
    compiler.hooks.afterEmit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
        let checksums = [];

        Object.keys(compilation.assets).forEach(function (filename) {
            const asset = compilation.assets[filename];
            const absolutePath = asset.existsAt;
            const file = fs.readFileSync(absolutePath);
            const hash = crypto.createHash('md5').update(file).digest('hex');
            const checksumEntry = checksumPattern.replace('hash', hash).replace('filename', filename);

            checksums.push(checksumEntry);
        });
        checksums = checksums.join('\n');
        fs.writeFileSync(
            outputPath,
            checksums,
            'utf-8'
        );
        compilation.assets[outputFilename] = new RawSource(checksums);
        compilation.assets[outputFilename].existsAt = outputPath;

        callback();
    });
};

module.exports = ChecksumPlugin;