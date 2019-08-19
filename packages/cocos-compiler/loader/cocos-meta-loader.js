const loaderUtils = require('loader-utils');

const META_TYPE_BUILDER_MAP = {
    'sprite': genSpriteFrame
};

function genSpriteFrame (meta, { scale=1 }) {
    return {
        '__type__': 'cc.SpriteFrame',
        'content': {
            'name': meta.name,
            'texture': meta.rawTextureUuid,
            'atlas': '',
            'rect': [
                meta.trimX * scale,
                meta.trimY * scale,
                meta.width * scale,
                meta.height * scale
            ],
            'offset': [
                meta.offsetX * scale,
                meta.offsetY * scale
            ],
            'originalSize': [
                meta.rawWidth * scale,
                meta.rawHeight * scale
            ],
            capInsets: [
                (meta.borderLeft || 0) * scale,
                (meta.borderTop || 0) * scale,
                (meta.borderRight || 0) * scale,
                (meta.borderBottom || 0) * scale
            ]
        }
    };
}

module.exports = function (content) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();
    const meta = JSON.parse(content);
    const builder = META_TYPE_BUILDER_MAP[meta.type];
    const params = loaderUtils.parseQuery(this.resourceQuery || '?');
    const scale = (params || {}).scale || 1;
    content = Object.keys(meta.subMetas).map((name) => {
        let subMeta = meta.subMetas[name];
        subMeta.name = name;

        return {
            uuid: subMeta.uuid,
            content: builder(subMeta, { scale })
        };
    });

    content = JSON.stringify(content);

    callback(
        null,
        `require("${meta.uuid}?scale=${scale}");
        cc.loader.load(${content}.map(function (item) {
            return {
                uuid: item.uuid,
                content: item.content,
                skips: [ cc.loader.assetLoader.id, cc.loader.downloader.id ],
                type: 'uuid'
            }
        }));
        `
    );
};