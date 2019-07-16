const loaderUtils = require('loader-utils');
const jimp = require('jimp');

async function resize (buff, scale) {
    let image = await jimp.read(buff);
    let mime = image.getMIME();
    image.scale(scale);
    return new Promise((res, rej) => {
        image.getBuffer(mime, (err, buff) => {
            err ? rej(err) : res(buff);
        });
    });
}

module.exports = async function (content) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();
    const resourcePath = this.resourcePath;
    const options = loaderUtils.getOptions(this);
    const metaPath = `${resourcePath}.meta`;
    const params = loaderUtils.parseQuery(this.resourceQuery || '?');
    const scale = parseFloat((params || {}).scale || 1);
    let outputPath = loaderUtils.interpolateName(
        this,
        options.name,
        {
            context: options.context || this.rootContext || this.options && this.options.context,
            content,
            regExp: options.regExp
        }
    );

    if (scale != 1) {
        try {
            content = await resize(content, scale);
        } catch (ex) {
            return callback(ex);
        }
    }

    this.emitFile(outputPath, content);

    this.fs.readFile(metaPath, (err, metaContent) => {
        if (err) return callback(err);
        let meta = JSON.parse(metaContent);

        callback(null, `module.exports = cc.AssetLibrary.setUuidToRawAsset(
            "${meta.uuid}",
            "${outputPath}",
            "cc.Texture2D"
        )`);
    });
};

module.exports.raw = true;