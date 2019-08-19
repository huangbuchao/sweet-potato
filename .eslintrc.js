module.exports = {
    "root": true,
    "env": {
        "node": true,
        "browser": true,
        "es6": true
    },
    "extends": ["eslint:recommended"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 9,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "globals": {
        "cc": true,
        "sweetPotato": true,
        "coconut": true,
        "bridge": true,
        "chrome": true,
        "localStorage": true,
        "HTMLDocument": true,
        "name": false
    },
    "rules": {
        // enable additional rules
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        // disable rules from base configurations
        "no-console": "off",
    }
};