const path = require('path')
const webpack = require('webpack')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const app = require('./package')

function externalizeAllDenpendencies(dependencies) {
  if (!dependencies) return {}
  return Object.keys(dependencies).reduce((externals, dependency) => {
    externals[dependency] = `commonjs2 ${dependency}`
    return externals
  }, {})
}

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
  entry: {
    renderer: path.resolve(__dirname, 'renderer/entry.js'),
    main: path.resolve(__dirname, 'main/entry.js'),
  },
  output: {
    path: __dirname,
    filename: '[name]/index.js',
    libraryTarget: 'commonjs2',
  },
  externals: externalizeAllDenpendencies(app.dependencies),
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@hooks': path.resolve(__dirname, 'renderer/hooks'),
      'vue$': 'vue/dist/vue.esm.js',
      'lodash': 'lodash-es',
    },
    modules: [
      path.resolve(__dirname, 'packages'),
      'node_modules',
    ],
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'packages'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'graceful-json5-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          transformAssetUrls: {
            img: [],
            image: [],
          },
        },
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
      filename: 'renderer/build/index.css',
    }),
    new VueLoaderPlugin(),
    new webpack.ProgressPlugin(),
  ],
  optimization: {
    minimize: false,
  },
}
