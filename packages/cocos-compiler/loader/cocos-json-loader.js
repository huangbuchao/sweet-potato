const path = require('path');

function isSklentonData (data) {
    return 'skeleton' in data &&
           'bones' in data &&
           'slots' in data &&
           'skins' in data;
}

function promisify (fn, ctx) {
    return (...args) => {
        return new Promise((res, rej) => {
            fn.apply(ctx, args.concat((err, ...resp) => {
                if (err) {
                    return rej(err);
                }

                if (resp.length > 1) {
                    res(resp);
                } else {
                    res(resp[0]);
                }
            }));
        });
    };
}

async function buildSklentonData (content, ctx, callback) {
    const resourcePath = ctx.resourcePath;
    const metaPath = resourcePath + '.meta';
    const readFile = promisify(ctx.fs.readFile, ctx.fs);
    const resolve = promisify(ctx.resolve, ctx);
    const name = path.basename(resourcePath, '.json');
    let atlasText = '';
    let atlasPath, meta, uuid;

    try {
        meta = JSON.parse(await readFile(metaPath));
    } catch (ex) {
        return callback(ex);
    }

    const animations = Object.keys(content.animations);

    for (const name of animations) {
        if (Object.keys(content.animations[name]).length === 0) {
            return callback(new Error(`检测到Spine动画空帧：${name}`), null);
        }
    }

    uuid = meta.uuid;

    if (meta.atlas) {
        try {
            atlasPath = (await resolve(ctx.context, meta.atlas))[0];
            atlasText = await readFile(atlasPath);
            ctx.addDependency(atlasPath);
        } catch (ex) {
            return callback(ex);
        }
    }

    ctx.emitFile(
        `import/${uuid.substr(0,2)}/${uuid}/raw-skeleton.json`,
        JSON.stringify(content)
    );

    let dep = meta.textures.map(uuid => `require("${uuid}");`).join('\n');
    if (meta.atlas) {
        dep += `require("${meta.atlas}");\n`;
    }

    content = JSON.stringify({
        "__type__": "sp.SkeletonData",
        "_name": name,
        "_objFlags": 0,
        "_rawFiles": [
            "raw-skeleton.json"
        ],
        "_skeletonJson": content,
        "_atlasText": atlasText.toString(),
        "atlasUrl": {
            "__uuid__": meta.atlas
        },
        "textures": meta.textures.map(t => {
            return { '__uuid__': t };
        }),
        "scale": meta.scale
    });

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

module.exports = function (content) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();

    const data = JSON.parse(content);

    if (isSklentonData(data)) {
        buildSklentonData(data, this, callback);
    } else {
        return JSON.stringify(data);
    }
};