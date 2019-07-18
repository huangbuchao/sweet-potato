const path = require('path');

function promisify(fn, ctx) {
    return (...args) => {
        return new Promise((res, rej) => {
            fn.apply(
                ctx,
                args.concat((err, ...resp) => {
                    if (err) {
                        return rej(err);
                    }

                    if (resp.length > 1) {
                        res(resp);
                    } else {
                        res(resp[0]);
                    }
                })
            );
        });
    };
}

async function buildFntData(content, ctx, callback) {
    const resourcePath = ctx.resourcePath;
    const metaPath = resourcePath + '.meta';
    const texturePath = resourcePath.split('.')[0] + '.png';
    const textureMetaPath = texturePath + '.meta';
    const readFile = promisify(ctx.fs.readFile, ctx.fs);
    const name = path.basename(resourcePath, '.fnt');
    let meta, uuid, textureMeta, spriteFrameUuid;

    try {
        meta = JSON.parse(await readFile(metaPath));
        textureMeta = JSON.parse(await readFile(textureMetaPath));
    } catch (ex) {
        return callback(ex);
    }

    uuid = meta.uuid;
    spriteFrameUuid = textureMeta.subMetas[name].uuid;
    content = JSON.stringify({
        __type__: 'cc.BitmapFont',
        _name: name,
        _objFlags: 0,
        _rawFiles: null,
        spriteFrame: { __uuid__: spriteFrameUuid },
        fontSize: meta.fontSize,
        fntDataStr: '',
        _fntConfig: content
    });

    let dep = `require("${spriteFrameUuid}");\n`;
    content = `
        ${dep}
        module.exports = new Promise(function (res, rej) {
            cc.loader.load({
                uuid: "${uuid}",
                content: ${content},
                skips: [ cc.loader.assetLoader.id, cc.loader.downloader.id ],
                type: 'uuid'
            }, function (err, result) {
                err ? rej(err) : res(result);
            });
        });
    `;

    callback(null, content);
}

function getConfigByKey(configText = '', key) {
    let itemConfigTextList = configText.split(' ');
    for (let i = 0, length = itemConfigTextList.length; i < length; i++) {
        let itemConfigText = itemConfigTextList[i];
        if (key == itemConfigText.substring(0, key.length)) {
            let value = itemConfigText.substring(key.length + 1);
            return JSON.parse(value);
        }
    }
    return 0;
}

module.exports = function(content) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();

    content = content.toString();

    content = content.split('\r\n').join('\n');
    let lines = content.split('\n');
    let kerningDict = {};
    let fontSize = getConfigByKey(lines[0], 'size');
    let commonHeight = getConfigByKey(lines[1], 'lineHeight');
    let atlasName = getConfigByKey(lines[2], 'file');

    let charsCount = getConfigByKey(lines[3], 'count');

    let fontDefDictionary = {};
    for (let i = 4; i < 4 + charsCount; i++) {
        let charText = lines[i];
        let letter = getConfigByKey(charText, 'id');
        let c = {};
        fontDefDictionary[letter] = c;
        c['rect'] = {
            x: getConfigByKey(charText, 'x'),
            y: getConfigByKey(charText, 'y'),
            width: getConfigByKey(charText, 'width'),
            height: getConfigByKey(charText, 'height')
        };
        c['xOffset'] = getConfigByKey(charText, 'xoffset');
        c['yOffset'] = getConfigByKey(charText, 'yoffset');
        c['xAdvance'] = getConfigByKey(charText, 'xadvance');
    }
    const data = {
        atlasName: atlasName,
        commonHeight: commonHeight,
        fontDefDictionary: fontDefDictionary,
        fontSize: fontSize,
        kerningDict: kerningDict
    };
    buildFntData(data, this, callback);
};
