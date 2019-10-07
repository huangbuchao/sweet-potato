const baseConfig = require("../baseConfig");

module.exports = baseConfig({
  entry: {
    hook: "./src/hook.js",
    backend: "./src/backend.js",
    devtools: "./src/devtools.js",
    launch: "../../backend/mock-launcher.js"
  },
  output: {
    path: __dirname + '/build',
    publicPath: "/build/",
    filename: "[name].js"
  },
  devtool: "#cheap-module-source-map",
});
