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
    main: path.resolve(__dirname, 'src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'src/build/'),
    filename: 'bundle.js',
  },
  externals: {
    'original-fs': 'commonjs2 original-fs',
    ...externalizeAllDenpendencies(app.dependencies),
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue$': 'vue/dist/vue.esm.js',
      'lodash': 'lodash-es',
    },
    modules: [
      path.resolve(__dirname, 'src/vendors'),
      'node_modules',
    ],
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'src/vendors'),
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
          'vue-style-loader',
          MiniCSSExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCSSExtractPlugin({
      filename: 'bundle.css',
    }),
    new webpack.ProgressPlugin(),
    new VueLoaderPlugin(),
  ],
  optimization: {
    minimize: false,
  },
}
