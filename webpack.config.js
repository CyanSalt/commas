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
    renderer: path.resolve(__dirname, 'src/renderer.js'),
    main: path.resolve(__dirname, 'src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'app/build/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  externals: externalizeAllDenpendencies(app.dependencies),
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'app/assets'),
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
      filename: 'renderer.css',
    }),
    new VueLoaderPlugin(),
    new webpack.ProgressPlugin(),
  ],
  optimization: {
    minimize: false,
  },
}
