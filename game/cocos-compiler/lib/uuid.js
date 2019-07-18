const Base64KeyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const AsciiTo64 = new Array(128);
for (let i = 0; i < 128; ++i) {
    AsciiTo64[i] = 0;
}
for (let i = 0; i < 64; ++i) {
    AsciiTo64[Base64KeyChars.charCodeAt(i)] = i;
}
const COMPRESSED_UUID_RE = /^[0-9a-zA-Z+/]{22,23}$/;
const LONG_UUID_RE = /^\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/;
exports.COMPRESSED_UUID_RE = COMPRESSED_UUID_RE;
exports.LONG_UUID_RE = LONG_UUID_RE;

exports.isUUID = function (str) {
    return COMPRESSED_UUID_RE.test(str) ||
        LONG_UUID_RE.test(str);
};

exports.createUUID =  function createUUID() {
    /* jshint ignore:start */
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
    /* jshint ignore:end */
};

exports.decompressUUID = function(i) {
    if (23 === i.length) {
        let e = [];
        for (let  r = 5; r < 23; r += 2) {
            let s = AsciiTo64[i.charCodeAt(r)],
                t = AsciiTo64[i.charCodeAt(r + 1)];
            e.push((s >> 2).toString(16));
            e.push(((3 & s) << 2 | t >> 4).toString(16));
            e.push((15 & t).toString(16));
        }
        i = i.slice(0, 5) + e.join("");
    } else if (22 === i.length) {
        let e = [];
        for (let r = 2; r < 22; r += 2) {
            let s = AsciiTo64[i.charCodeAt(r)],
                t = AsciiTo64[i.charCodeAt(r + 1)];
            e.push((s >> 2).toString(16));
            e.push(((3 & s) << 2 | t >> 4).toString(16));
            e.push((15 & t).toString(16));
        }
        i = i.slice(0, 2) + e.join("");
    }
    return [
        i.slice(0, 8),
        i.slice(8, 12),
        i.slice(12, 16),
        i.slice(16, 20),
        i.slice(20)
    ].join("-");
};

exports.compressUUID = function (uuid) {
    uuid = uuid.replace(/-/g, '');
    var r = 5, len = uuid.length;
    var o = [];
    var t = uuid.slice(0, r);

    while (r < len) {
        var u = parseInt(uuid[r], 16);
        var a = parseInt(uuid[r + 1], 16);
        var d = parseInt(uuid[r + 2], 16);

        o.push(Base64KeyChars[u << 2 | a >> 2]);
        o.push(Base64KeyChars[(3 & a) << 4 | d]);
        r += 3;
    }
    return t + o.join("");
};