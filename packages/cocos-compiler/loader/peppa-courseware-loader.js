const path = require('path');
const { promisify } = require('util');
const fs = require('fs');

const buildCoursewareFuncMap = {
    async buildCourseware1(content) {
        if (this.cacheable) this.cacheable();
        const callback = this.async();
        const context = this.context;
        const readFile = promisify(this.fs.readFile.bind(this.fs));

        let uuids = [];

        for (let part of content.parts) {
            let metaPath = `${path.resolve(context, part.prefab)}.meta`;
            let meta;
            try {
                meta = JSON.parse(await readFile(metaPath));
            } catch (ex) {
                return callback(ex);
            }

            this.addDependency(metaPath);
            part.uuid = meta.uuid;
            uuids.push(part.uuid);
        }

        callback(
            null,
            `
            var courseware = ${JSON.stringify(content)};
            var defer = Promise.all([${uuids
        .map(uuid => `require("${uuid}")`)
        .join(',')}])
                .then(function (prefabs) {
                    courseware.parts.forEach(function (part, i) {
                        part.prefab = prefabs[i];
                    });
                    return courseware;
                });
            defer.then(function (courseware) {
                PeppaAssetCallback("${content.name}", courseware);
            });
            module.exports = defer;
            `
        );
    },

    async buildCourseware2(content) {
        if (this.cacheable) this.cacheable();
        const callback = this.async();
        const context = this.context;
        const readFile = promisify(this.fs.readFile.bind(this.fs));
        const uuids = [],
            elements = [];

        resolveCoursewareJson(context, content.blocks, elements);

        for (const element of elements) {
            const metaPath = `${element}.meta`;
            let meta;
            try {
                meta = JSON.parse(await readFile(metaPath));
            } catch (ex) {
                return callback(ex);
            }

            this.addDependency(metaPath);
            uuids.push(meta.uuid);
        }

        callback(
            null,
            `
            var courseware = ${JSON.stringify(content)};
            var defer = Promise.all([${uuids
        .map(uuid => `require("${uuid}")`)
        .join(',')}])
                .then(function (prefabs) {
                    var index = 0;
                    courseware.blocks.forEach(function (params) {
                        var parts = params.parts;
                        parts.forEach(function (params) {
                            var steps = params.steps;

                            steps.forEach(function (params) {
                                var stepPrefabs = params.prefabs

                                stepPrefabs.forEach(function (prefab, i) {
                                    stepPrefabs[i] = prefabs[index];
                                    index++;
                                });
                            });
                        });
                    });
                    return courseware;
                });
            defer.then(function (courseware) {
                PeppaAssetCallback("${content.name}", courseware);
            });
            module.exports = defer;
            `
        );
    },

    async buildCourseware3(content) {
        if (this.cacheable) this.cacheable();
        const callback = this.async();
        const context = this.context;
        const readFile = promisify(this.fs.readFile.bind(this.fs));
        const uuids = [],
            elements = [];

        resolveCoursewareJson(context, content.blocks, elements);

        for (const element of elements) {
            const metaPath = `${element}.meta`;
            let meta;
            try {
                meta = JSON.parse(await readFile(metaPath));
            } catch (ex) {
                return callback(ex);
            }

            this.addDependency(metaPath);
            uuids.push(meta.uuid);
        }

        callback(
            null,
            `
            var courseware = ${JSON.stringify(content)};
            var defer = Promise.all([${uuids
        .map(uuid => `require("${uuid}")`)
        .join(',')}])
                .then(function (prefabs) {
                    var index = 0;
                    courseware.blocks.forEach(function (params) {
                        var parts = params.parts;
                        parts.forEach(function (params) {
                            var steps = params.steps;

                            steps.forEach(function (params) {
                                var elements = params.elements

                                elements.forEach(function (item, i) {
                                    if (Object.prototype.toString.call(item) === '[object Object]') {
                                        item.element = prefabs[index];
                                    } else {
                                        elements[i] = prefabs[index];
                                    }

                                    index++;
                                });
                            });
                        });
                    });
                    return courseware;
                });
            defer.then(function (courseware) {
                PeppaAssetCallback("${content.name}", courseware);
            });
            module.exports = defer;
            `
        );
    }
};

function resolveCoursewareJson(context, jsonFiles, elements) {
    let index = 0;
    for (let item of jsonFiles) {
        const itemPath = path.resolve(context, item.element || item);

        if (item.element) {
            jsonFiles[index] = Object.assign({}, item, { element: undefined });
            elements.push(itemPath);
            index++;
            continue;
        }

        if (itemPath.indexOf('.prefab') > -1) {
            jsonFiles[index] = itemPath;
            elements.push(itemPath);
            index++;
            continue;
        }

        item = jsonFiles[index] = JSON.parse(
            fs.readFileSync(itemPath, { encoding: 'utf-8' })
        );

        item.__name__ = item.name || path.basename(path.dirname(itemPath));

        resolveCoursewareJson(
            path.dirname(itemPath),
            item.parts || item.steps || item.elements || item.prefabs,
            elements
        );

        index++;
    }
}

module.exports = function(content) {
    content = JSON.parse(content);
    content.version = content.version || 1;
    buildCoursewareFuncMap[`buildCourseware${content.version}`].call(
        this,
        content
    );
};
