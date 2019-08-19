var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var mkdirp = Promise.promisify(require('mkdirp'));

var FS = Promise.promisifyAll(fs);

FS.getFiles = async function getFiles (dir) {
    let children = await FS.readdirAsync(dir);
    let ret = [];

    for (let child of children) {
        let childpath = path.join(dir, child);
        let stat = FS.statSync(childpath);
        if (stat.isFile()) {
            ret.push(childpath);
        } else if (stat.isDirectory()) {
            ret = ret.concat(await getFiles(childpath));
        }
    }

    return ret;
};

FS.getFilesSync = function getFilesSync (dir) {
    let children = FS.readdirSync(dir);
    let ret = [];

    for (let child of children) {
        let childpath = path.join(dir, child);
        let stat = FS.statSync(childpath);
        if (stat.isFile()) {
            ret.push(childpath);
        } else if (stat.isDirectory()) {
            ret = ret.concat(getFilesSync(childpath));
        }
    }

    return ret;
};

FS.mkdirp = mkdirp;

FS.readJSON = async function readJSON (path) {
    return JSON.parse(await FS.readFileAsync(path));
};

FS.readJSONSync = function (path) {
    return JSON.parse(FS.readFileSync(path, 'utf-8'));
};

module.exports = FS;