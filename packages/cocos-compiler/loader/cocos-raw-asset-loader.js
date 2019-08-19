const path = require('path');
const loaderUtils = require('loader-utils');
const VideoLib = require('node-video-lib');
const fs = require('fs');

const EXT_TYPE_MAP = {
    '.mp3': 'cc.AudioClip',
    '.mp4': 'cc.RawAsset',
    '.plist': 'cc.RawAsset',
    '.atlas': 'cc.RawAsset'
};

module.exports = async function(content) {
    if (this.cacheable) this.cacheable();
    const callback = this.async();
    const resourcePath = this.resourcePath;
    const extname = path.extname(resourcePath);
    const type = EXT_TYPE_MAP[extname];
    const options = loaderUtils.getOptions(this);
    const metaPath = `${resourcePath}.meta`;
    let outputPath = loaderUtils.interpolateName(this, options.name, {
        context:
            options.context ||
            this.rootContext ||
            (this.options && this.options.context),
        content,
        regExp: options.regExp
    });

    this.emitFile(outputPath, content);

    if (!type) {
        if (extname === '.wav') {
            return callback(
                new Error(
                    `未识别的音频类型: ${resourcePath}, 音频请使用MP3格式`
                )
            );
        }

        this.emitWarning(
            `未识别的Raw Asset类型: ${extname}: ${resourcePath}，音频请使用mp3格式，视频请使用mp4格式`
        );
        return callback(
            null,
            `module.exports = __webpack_public_path__ + "${outputPath}"`
        );
    }

    if (extname === '.mp4') {
        fs.open(resourcePath, 'r', (err, fd) => {
            if (err) {
                return callback(
                    err,
                    `module.exports = __webpack_public_path__ + "${outputPath}"`
                );
            }

            try {
                const videoTrack = VideoLib.MovieParser.parse(fd).videoTrack();
                if (videoTrack === null) {
                    return callback(new Error(`${resourcePath}, 视频解析出错`));
                }

                const { width, height } = videoTrack;

                if (!width || !height) {
                    return callback(
                        new Error(`${resourcePath}, 没有获取到视频的分辨率`)
                    );
                }

                if (width > 1024 || height > 1024) {
                    return callback(
                        new Error(
                            `${resourcePath}, 视频的分辨率为${width} x ${height} 大于 1024 x 768`
                        )
                    );
                }

                const { size } = fs.statSync(resourcePath);

                if (size > 30 * (1024 * 1024)) {
                    return callback(
                        new Error(`${resourcePath} 视频大小超过30MB`)
                    );
                }

                const bitRate =
                    ((size / 1024) * 8) / videoTrack.relativeDuration();
                if (bitRate > 1000 && size > 10 * (1024 * 1024)) {
                    return callback(
                        new Error(`${resourcePath} 视频码率超过900`)
                    );
                }

                const framerate = Math.round(
                    80 / videoTrack.samples[80].relativeTimestamp()
                );

                if (framerate > 25) {
                    return callback(
                        new Error(`${resourcePath} 视频帧率超过24帧`)
                    );
                }

                return this.fs.readFile(metaPath, (err, metaContent) => {
                    if (err) return callback(err);
                    let meta = JSON.parse(metaContent);

                    callback(
                        null,
                        `module.exports = cc.AssetLibrary.setUuidToRawAsset(
                            "${meta.uuid}",
                            "${outputPath}",
                            "${type}"
                        )`
                    );
                });
            } catch (ex) {
                callback(
                    ex,
                    `module.exports = __webpack_public_path__ + "${outputPath}"`
                );
            } finally {
                fs.closeSync(fd);
            }
        });
        return;
    }

    this.fs.readFile(metaPath, (err, metaContent) => {
        if (err) return callback(err);
        let meta = JSON.parse(metaContent);

        callback(
            null,
            `module.exports = cc.AssetLibrary.setUuidToRawAsset(
            "${meta.uuid}",
            "${outputPath}",
            "${type}"
        )`
        );
    });
};

module.exports.raw = true;
