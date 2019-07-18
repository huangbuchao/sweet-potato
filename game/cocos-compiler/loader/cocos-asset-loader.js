const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');
const fs = require('fs');

const util = require('../lib/util');
const UUID = require('../lib/uuid');
const COMPRESSED_UUID_RE = /^[0-9a-zA-Z+/]{22,23}$/;
const resizeAble = {};

const getResizeScale = function(meta, resolved) {
    resolved = resolved.replace(/\.meta$/, '');
    let subMetas = Object.keys(meta.subMetas);
    let submeta = meta.subMetas[subMetas[0]];
    let w = submeta.rawWidth;
    let h = submeta.rawHeight;

    if (w > 2048 || h > 2048) {
        throw new Error(`${resolved} 图片(${w} x ${h}) 超过 2048 * 2048`);
    }

    const { size } = fs.statSync(resolved);
    if (size > 4 * (1024 * 1024)) {
        throw new Error(
            `${resolved} 图片大小为${(size / (1024 * 1024)).toFixed(
                2
            )}MB, 超过4MB`
        );
    }

    if (w > 300 || h > 300) {
        return 0.5;
    } else {
        return 1;
    }
};

module.exports = async function(source) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();
    const resourcePath = this.resourcePath;
    const metaPath = `${resourcePath}.meta`;
    const readFile = util.promisify(this.fs.readFile, this.fs);
    const extname = path.extname(resourcePath);
    const basename = path.basename(resourcePath);
    const resolve = Promise.promisify(this.resolve);
    const readMeta = path => {
        return new Promise((res, rej) => {
            this.fs.readFile(path, (err, content) => {
                err ? rej(err) : res(JSON.parse(content.toString()));
            });
        });
    };

    let value, meta;

    try {
        value = JSON.parse(source);
        meta = JSON.parse(await readFile(metaPath));
    } catch (ex) {
        return callback(ex);
    }

    this.addDependency(metaPath);
    let deps = [];
    util.walkObject(value, function(key, value, parent) {
        if (key == '__uuid__') {
            deps.push(value);
        } else if (key == '__type__' && COMPRESSED_UUID_RE.test(value)) {
            deps.push(UUID.decompressUUID(value));
        } else if (
            key == '_sizeMode' &&
            value == 1 &&
            parent.__type__ == 'cc.Sprite' &&
            parent._spriteFrame != null
        ) {
            // 将sizeMode为TRIMMED（1）的sprite改为CUSTOM（0）
            // TODO: 做更多判定以实现安全地做这一转变
            parent._sizeMode = 0;
            resizeAble[parent._spriteFrame.__uuid__] = true;
        }
    });
    source = JSON.stringify(value);

    deps = _.chain(deps)
        .uniq()
        .without(meta.uuid)
        .value();

    try {
        deps = await Promise.map(deps, async uuid => {
            let resolved = await resolve(this.context, uuid);
            if (!/\.meta$/.test(resolved)) {
                return `require("${uuid}")`;
            }
            let meta = await readMeta(resolved);
            if (resizeAble[uuid] && meta.type == 'sprite') {
                return `require("${uuid}?scale=${getResizeScale(
                    meta,
                    resolved
                )}")`;
            } else {
                return `require("${uuid}")`;
            }
        });
    } catch (ex) {
        return callback(ex);
    }

    let pushScene = '';
    if (extname == '.fire') {
        let scenename = path.basename(basename, '.fire');
        pushScene = `cc.game._sceneInfos.push({
            url: "db://assets/${basename}",
            uuid: "${meta.uuid}"
        });
        promise.then(function (scene) {
            window.PeppaAssetCallback(
                "${scenename}",
                {
                    url: "db://assets/${basename}",
                    name: "${scenename}",
                    scene: scene
                }
            );
        });
        `;
    }

    callback(
        null,
        `
        var deps = [${deps.join(',')}];
        var promise = Promise.all([deps])
            .then(function () {
                return new Promise(function (res, rej) {
                    cc.loader.load({
                        uuid: "${meta.uuid}",
                        type: 'uuid',
                        content: ${source},
                        skips: [ cc.loader.assetLoader.id, cc.loader.downloader.id ]
                    }, function (err, result) {
                        err ? rej(err) : res(result);
                    });
                });
            });

        ${pushScene}

        module.exports = promise;
    `
    );
};
