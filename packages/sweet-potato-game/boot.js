(function(window, cc, undefined) {
    window.loadScript = source => {
        return new Promise((resolve, reject) => {
            const doc = window.document;
            const head = doc.getElementsByTagName('head')[0];
            const script = doc.createElement('script');
            const clean = () => {
                script.onload = null;
                script.onerror = null;
            };
            script.onload = () => {
                clean();
                resolve();
            };
            script.onerror = () => {
                clean();
                reject();
            };
            script.async = true;
            script.src = source;
            head.appendChild(script);
        });
    };

    window.initGameScenesInfo = () => {};

    const option = {
        id: 'GameCanvas',
        scenes: [],
        debugMode: cc.DebugMode.ERROR,
        showFPS: false,
        frameRate: 30,
        jsList: [],
        groupList: ['default'],
        collisionMatrix: [[true]],
        renderMode: 2
    };

    let customMap = {};
    let prev_getAssetInfoInRuntime = cc.AssetLibrary._getAssetInfoInRuntime;
    let prev_getAssetUrl = cc.AssetLibrary._getAssetUrl;

    cc.AssetLibrary.setUuidToRawAsset = function(uuid, url, type) {
        customMap[uuid] = {
            url,
            type: cc.js._getClassById(type)
        };
    };

    cc.AssetLibrary._getAssetInfoInRuntime = function(uuid, result) {
        let customAsset = customMap[uuid];
        result = result || {
            url: null,
            raw: false
        };

        if (!customAsset) {
            return prev_getAssetInfoInRuntime.call(
                cc.AssetLibrary,
                uuid,
                result
            );
        }

        result.url = customAsset.url;
        result.raw = true;

        return result;
    };

    cc.AssetLibrary._getAssetUrl = function(uuid) {
        let customAsset = customMap[uuid];
        if (!customAsset) {
            return prev_getAssetUrl(uuid);
        }

        return customAsset.url;
    };

    const assetResolverMap = {};

    window.loadAsset = async id => {
        let defer = new Promise(resolve => {
            assetResolverMap[id] = resolve;
        });

        await window.loadScript(`${id}.js`);

        return defer;
    };

    window.PeppaAssetCallback = (id, asset) => {
        assetResolverMap[id](asset);
    };

    window.bootGame = room => {
        cc.game.run(option, async () => {
            cc.view.resizeWithBrowserSize(true);
            cc.view.enableAntiAlias(false);

            cc.AssetLibrary.init({
                libraryPath: `import`,
                rawAssetsBase: ``,
                rawAssets: {},
                packedAssets: {}
            });

            window.loadAsset(room).then(classroom => {
                let launchScene = classroom.url;
                if (cc.runtime) {
                    cc.director.setRuntimeLaunchScene(launchScene);
                }
                cc.director.loadScene(launchScene, null, function() {
                    cc.loader.onProgress = null;
                    console.log('game running!', undefined);
                });
            });
        });
    };
})(window, cc);
