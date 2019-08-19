const path = require('path');
const UUID = require('../lib/uuid');

module.exports = function (content) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();
    let metaPath = `${this.resourcePath}.meta`;

    this.fs.readFile(metaPath, (err, buff) => {
        if (err) return callback(null, content);
        this.addDependency(metaPath);

        let meta = JSON.parse(buff.toString());
        let uuid = UUID.compressUUID(meta.uuid);
        let name = path.basename(this.resourcePath, '.js');

        content = `cc._RF.push(module, '${uuid}', '${name}');\n` +
                content +
                `\ncc._RF.pop();`;

        callback(null, content);
    });
};