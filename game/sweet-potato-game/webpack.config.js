const path = require('path');
// const cwd = process.cwd();
// const { name } = require(`${cwd}/package.json`);

module.exports = {
    entry: {
        main: [
            'babel-polyfill',
            path.resolve(`${__dirname}/boot.js`),
            path.resolve(`${__dirname}/index.html`)
        ],
        ['sweet-potato']: path.resolve(`${__dirname}/assets/sweet-potato.fire`)
    }
};
