const path = require("path");
const { DefinePlugin } = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");

module.exports = {
  entry: {
    devtools: "./src/devtools.js",
    backend: "./src/backend.js",
    hook: "./src/hook.js"
  },
  output: {
    path: path.join(__dirname, "/build"),
    publicPath: "/build/",
    filename: "[name].js"
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  resolve: {
    alias: {
      frontend: path.resolve(__dirname, "../../frontend"),
      backend: path.resolve(__dirname, "../../backend"),
      shared: path.resolve(__dirname, "../../shared"),
    },
    symlinks: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules|vue\/dist|vuex\/dist/
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        use: [
          "vue-style-loader",
          "css-loader",
          "postcss-loader"
        ]
      },
      {
        test: /\.styl(us)?$/,
        use: [
          "vue-style-loader",
          "css-loader",
          "postcss-loader",
          "stylus-loader",
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [
                path.resolve(__dirname, '../src/devtools/style/imports.styl')
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 0
        }
      }
    ]
  },
  devtool: "#cheap-module-source-map",
  devServer: {
    hot: false,
    quiet: true,
    host: "0.0.0.0",
    port: process.env.PORT
  },
  performance: {
    hints: false
  },
  stats: {
    colors: true
  },
  plugins: [
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin(),
    new DefinePlugin({
      __DEV__: "__DEV__",
      "process.env.POTATO": "handon"
    })
  ]
};
