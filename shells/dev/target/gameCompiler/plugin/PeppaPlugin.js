const _ = require('lodash');
const path = require('path');
const querystring = require('querystring');
const RawSource = require("webpack-sources").RawSource;
const AssetManager = require('../lib/AssetManager');
const UUID = require('../lib/uuid');

const decompressUUID = _.memoize(UUID.decompressUUID);
const compressUUID = _.memoize(UUID.compressUUID);

const PLUGIN_NAME = 'PeppaPlugin';

class PeppaPlugin {
    constructor (options) {
        this.options = options;
        this.assetManager = new AssetManager({
            hashPrefix: options.hashPrefix
        });
    }
    apply(compiler) {
        const watchMode = this.options.watchMode || false;
        const assetManager = this.assetManager;
        (this.options.assetDirs || []).forEach((dir) => {
            assetManager.mountSync(dir);
            if (watchMode) {
                assetManager.watch(dir);
            }
        });

        compiler.resolverFactory.hooks.resolver.tap('normal', PLUGIN_NAME, resolver => {
            resolver.hooks.module.tapAsync(PLUGIN_NAME, async (request, context, callback) => {
                if (UUID.isUUID(request.request)) {
                    let uuid = request.request;
                    let target = await assetManager.getPathByUUID(request.request);
                    if (target) {
                        let extname = path.extname(target);

                        if (extname == '.prefab' || extname == '.fire') {
                            let query = querystring.parse((request.query || '').replace(/^\?/, ''));
                            query.compressTexture = this.options.compressTexture;

                            request.query = '?' + querystring.stringify(query);
                        }

                        request.request = target;
                        request.file = true;
                        resolver.doResolve(
                            resolver.hooks.resolve,
                            request,
                            `${PLUGIN_NAME} transform ${uuid} to ${target}`,
                            context,
                            callback
                        );
                        return;
                    }
                }

                return callback();
            });
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.optimizeAssets.tapAsync(PLUGIN_NAME, (assets, callback) => {
                let getNewUUID = _.memoize((uuid) => assetManager.getNewUUID(uuid));
                try {
                    Object.keys(assets).forEach((filepath) => {
                        const SKELETON_PATH_RE = /import\/(\w{2})\/(\w{8}-\w{4}-4\w{3}-\w{4}-\w{12})\/raw-skeleton.json/;

                        if (SKELETON_PATH_RE.test(filepath)) {
                            let newPath = filepath.replace(SKELETON_PATH_RE, (filepath, _, uuid) => {
                                let newUUID = getNewUUID(uuid);

                                if (!newUUID) {
                                    return filepath;
                                }

                                newUUID = compressUUID(newUUID);

                                return `import/${newUUID.substr(0,2)}/${newUUID}/raw-skeleton.json`;
                            });
                            assets[newPath] = assets[filepath];
                            delete assets[filepath];

                            return;
                        }

                        if (/\.(js|json)$/.test(filepath)) {
                            let asset = assets[filepath];
                            let source = asset.source();

                            source = source.replace(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/g, (uuid) => {
                                let newUUID = getNewUUID(uuid);
                                if (!newUUID) {
                                    return uuid;
                                }

                                return compressUUID(newUUID);
                            });

                            source = source.replace(/[0-9a-zA-Z+/]{22,23}/g, (uuid) => {
                                let newUUID = getNewUUID(decompressUUID(uuid));
                                if (!newUUID) {
                                    return uuid;
                                }

                                return compressUUID(newUUID);
                            });

                            assets[filepath] = new RawSource(source);
                        }
                    });
                } catch (ex) {
                    return callback(ex);
                }

                callback(null);
            });
        });
    }
}

module.exports = PeppaPlugin;