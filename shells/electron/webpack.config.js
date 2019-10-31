const createConfig = require("../baseConfig");
const { join } = require("path");

module.exports = createConfig({
  entry: {
    devtools: "./src/devtools.js",
    backend: "./src/backend.js",
    hook: "./src/hook.js",
    "mock-launcher": "./src/mock-launcher.js"
  },
  output: {
    path: join(__dirname, "/build"),
    publicPath: "/build/",
    filename: "[name].js"
  },
  devtool: '#cheap-module-source-map'
});