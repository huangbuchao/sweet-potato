const path = require("path");
const baseConfig = require("../baseConfig");

module.exports = baseConfig({
  entry: {
    hook: "./src/hook.js",
    backend: "./src/backend.js",
    devtools: "./src/devtools.js",
    launch: "../../backend/mock-launcher.js"
  },
  output: {
    path: path.join(__dirname, '/build'),
    publicPath: "/build/",
    filename: "[name].js"
  },
  devtool: process.env.NODE_ENV === 'development' ? "#cheap-module-source-map" : false,
});
