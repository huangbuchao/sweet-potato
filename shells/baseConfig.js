const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const { VueLoaderPlugin } = require("vue-loader");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");

module.exports = config => {
  const baseConfig = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    resolve: {
      alias: {
        frontend: path.resolve(__dirname, "../frontend"),
        backend: path.resolve(__dirname, "../backend"),
        shared: path.resolve(__dirname, "../shared"),
        agent: path.resolve(__dirname, "../agent"),
        vendor: path.resolve(__dirname, "../vendor")
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
          use: ["vue-style-loader", "css-loader", "postcss-loader"]
        },
        {
          test: /\.styl(us)?$/,
          use: [
            "vue-style-loader",
            "css-loader",
            "postcss-loader",
            "stylus-loader",
            {
              loader: "style-resources-loader",
              options: {
                patterns: [
                  path.resolve(__dirname, "../frontend/style/imports.styl")
                ]
              }
            }
          ]
        },
        {
          test: /\.(png|woff2|ttf)$/,
          loader: "url-loader",
          options: {
            limit: 0
          }
        }
      ]
    },
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
      new webpack.DefinePlugin({
        __DEV__: "__DEV__",
        "process.env.POTATO": "handon"
      })
    ]
  };

  if (process.env.NODE_ENV === "production") {
    const UglifyPlugin = require("uglifyjs-webpack-plugin");
    baseConfig.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": '"production"'
      })
    );
    baseConfig.optimization = {
      minimizer: [
        new UglifyPlugin({
          exclude: /backend/,
          uglifyOptions: {
            compress: {
              // turn off flags with small gains to speed up minification
              arrows: false,
              collapse_vars: false, // 0.3kb
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,

              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans: true, // 0.7kb
              if_return: true, // 0.4kb
              sequences: true, // 0.7kb
              unused: true, // 2.3kb

              // required features to drop conditional branches
              conditionals: true,
              dead_code: true,
              evaluate: true
            },
            mangle: {
              safari10: true
            }
          },
          sourceMap: false,
          cache: true,
          parallel: true
        })
      ]
    };
  }

  return merge(baseConfig, config);
};
