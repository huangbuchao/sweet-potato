exports.walkObject = function walkObject (obj, fn) {
    if (!obj) {
        return;
    }

    if (Array.isArray(obj)) {
        obj.forEach(function (o) {
            walkObject(o, fn);
        });
    } else if (typeof obj == 'object') {
        let keys = Object.keys(obj);
        for (let key of keys) {
            if (typeof obj[key] == 'object') {
                walkObject(obj[key], fn);
            } else {
                fn(key, obj[key], obj);
            }
        }
    }
};

exports.promisify = function promisify (fn, context) {
    return function (...args) {
        return new Promise(function (res, rej) {
            args = args.concat(function (err, ...results) {
                if (results.length == 1) {
                    results = results[0];
                }

                err ? rej(err) : res(results);
            });
            fn.apply(context, args);
        });
    };
};