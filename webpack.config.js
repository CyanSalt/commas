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
  entry: path.resolve(__dirname, 'renderer/main.mjs'),
  output: {
    path: path.resolve(__dirname, 'renderer/dist'),
    filename: 'index.js',
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
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCSSExtractPlugin({
      filename: 'index.css',
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
    moduleIds: 'named',
    usedExports: false,
  },
  // experiments: {
  //   outputModule: true,
  // },
}
