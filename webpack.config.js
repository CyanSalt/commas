const path = require('path')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')

module.exports = {
  target: 'electron-renderer',
  devtool: 'source-map',
  stats: {
    modules: false,
    entrypoints: false,
  },
  node: {
    __dirname: false,
  },
  entry: path.resolve(__dirname, 'renderer/main.mjs'),
  output: {
    path: __dirname,
    filename: 'renderer/build/index.js',
    libraryTarget: 'commonjs2',
    // module: true,
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm-bundler.js',
    },
  },
  module: {
    rules: [
      // TODO: remove in webpack@5
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /\?vue/,
            use: [
              {
                loader: MiniCSSExtractPlugin.loader,
                options: {
                  esModule: false,
                },
              },
              'css-loader',
            ],
          },
          {
            use: [
              MiniCSSExtractPlugin.loader,
              'css-loader',
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCSSExtractPlugin({
      filename: 'renderer/build/index.css',
    }),
    new VueLoaderPlugin(),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    }),
  ],
  optimization: {
    minimize: false,
    // moduleIds: 'named',
    namedModules: true,
    usedExports: false,
  },
  // experiments: {
  //   outputModule: true,
  // },
}
