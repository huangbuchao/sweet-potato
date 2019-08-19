var path = require('path');
var chokidar = require('chokidar');
var FS = require('./fs');
var UUID = require('./uuid');

const EXT_TYPE_MAP = {
    '.jpg': 'texture',
    '.jpeg': 'texture',
    '.png': 'texture',
    '.js': 'javascript',
    '.anim': 'animation-clip',
    '.prefab': 'prefab',
    '.mp3': 'audio-clip',
    '.atlas': 'atlas'
};

function getMetaSync (metapath) {
    let meta = FS.readJSONSync(metapath);
    let extname = path.extname(path.basename(metapath, '.meta'));
    let filepath = metapath.replace(/\.meta$/, '');
    let type = EXT_TYPE_MAP[extname];

    if (!type) {
        if (extname == '.json') {
            let data = FS.readJSONSync(filepath);
            if ('skeleton' in data &&
                'bones' in data &&
                'slots' in data &&
                'skins' in data
            ) {
                type = 'sklenton-data';
            }
        }
    }

    return { meta, type, filepath };
}

class AssetManager {
    constructor ({ hashPrefix }) {
        this.uuidMap = {};
        this.pathMap = {};

        this.uuidCache = {};
        this.mountedDir = [];

        this.hashPrefix = hashPrefix;
    }
    async mount (dir) {
        let files = await FS.getFiles(dir);
        let metas = files
            .filter(file => /\.meta$/.test(file));

        this.mountedDir.push(dir);

        for (let metapath of metas) {
            metapath = path.resolve(metapath);
            let meta = JSON.parse(await FS.readFileAsync(metapath, 'utf-8'));
            let filepath = metapath.replace(/\.meta$/, '');
            let extname = path.extname(path.basename(metapath, '.meta'));
            let type = EXT_TYPE_MAP[extname];

            if (!type) {
                if (extname == '.json') {
                    let data = await FS.readJSON(filepath);
                    if ('skeleton' in data &&
                        'bones' in data &&
                        'slots' in data &&
                        'skins' in data
                    ) {
                        type = 'sklenton-data';
                    }
                }
            }

            this.saveMeta({
                meta,
                metapath,
                filepath,
                type
            });
        }
    }
    watch(dir) {
        const updateMeta = (metapath) => {
            let { meta, type, filepath } = getMetaSync(metapath);

            this.saveMeta({
                meta,
                metapath,
                filepath,
                type
            });
        };

        chokidar.watch(`${dir}/**/*.meta`, {ignoreInitial: true})
            .on('add', updateMeta)
            .on('change', updateMeta);
    }
    mountSync (dir) {
        let files = FS.getFilesSync(dir);
        let metas = files
            .filter(file => /\.meta$/.test(file));
        for (let metapath of metas) {
            metapath = path.resolve(metapath);
            let {meta, type, filepath} = getMetaSync(metapath);

            this.saveMeta({
                meta,
                metapath,
                filepath,
                type
            });
        }
    }
    saveMeta (params) {
        let { meta, metapath, filepath, type } = params;
        let uuid = meta.uuid;

        let newUUID = uuid.replace(/^.{8}(.*)$/, `${this.hashPrefix}$1`);

        while (this.uuidCache[newUUID]) {
            newUUID = UUID.createUUID().replace(/^.{8}(.*)$/, `${this.hashPrefix}$1`);
        }

        this.uuidCache[newUUID] = true;

        this.uuidMap[uuid] = {
            type,
            uuid,
            meta,
            filepath,
            metapath,
            newUUID
        };

        this.uuidMap[newUUID] = {
            type,
            uuid,
            meta,
            filepath,
            metapath,
            newUUID
        };

        if (filepath) {
            this.pathMap[filepath] = {
                type,
                uuid,
                meta,
                filepath,
                metapath,
                newUUID
            };
        }

        if (meta.subMetas) {
            let subMetas = meta.subMetas;
            let names = Object.keys(subMetas);
            let subMetaType = '';

            if (meta.type == 'sprite') {
                subMetaType = 'sprite-frame';
            }

            for (let name of names) {
                let meta = subMetas[name];
                meta.name = name;
                this.saveMeta({
                    type: subMetaType,
                    meta,
                    metapath: `${metapath}`,
                    filepath: `${metapath}`
                });
            }
        }
    }
    getNewUUID (uuid) {
        return (this.uuidMap[uuid] || {}).newUUID;
    }
    getPathByUUID (uuid) {
        return (this.uuidMap[uuid] || {}).filepath;
    }
    async getContentByUUID (uuid) {
        let config = this.uuidMap[uuid];
        if (config.filepath) {
            return await FS.readFileAsync(config.filepath);
        } else {
            return config.meta;
        }
    }
    getUUIDByPath (filepath) {
        return (this.pathMap[filepath] || {}).uuid;
    }
    getMetaByUUID (uuid) {
        return (this.uuidMap[uuid] || {}).meta;
    }
    getAssetTypeByUUID (uuid) {
        return (this.uuidMap[uuid] || {}).type;
    }
}

AssetManager.getAssetType = filepath => {
    return EXT_TYPE_MAP[path.extname(filepath)];
};

module.exports = AssetManager;