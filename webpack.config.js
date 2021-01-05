const path = require('path')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const sass = require('sass')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')

module.exports = [
  {
    target: 'electron-main',
    devtool: 'source-map',
    stats: {
      modules: false,
      entrypoints: false,
    },
    entry: path.resolve(__dirname, 'main/index.ts'),
    output: {
      path: path.resolve(__dirname, 'main/dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    externals: [
      /^(?!\.|\/)/,
      /\/resources\//,
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            onlyCompileBundledFiles: true,
          },
        },
      ],
    },
    plugins: [
      new webpack.ProgressPlugin(),
    ],
    optimization: {
      minimize: false,
    },
  },
  {
    target: 'electron-renderer',
    devtool: 'source-map',
    stats: {
      modules: false,
      entrypoints: false,
    },
    entry: path.resolve(__dirname, 'renderer/app.ts'),
    output: {
      path: path.resolve(__dirname, 'renderer/dist'),
      filename: 'app.js',
      libraryTarget: 'commonjs2',
      // module: true,
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm-bundler.js',
      },
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            appendTsSuffixTo: [
              '\\.vue$',
            ],
            onlyCompileBundledFiles: true,
          },
        },
        {
          test: /\.scss$/,
          use: [
            MiniCSSExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
              },
            },
          ],
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
        filename: 'app.css',
      }),
      new VueLoaderPlugin(),
      new webpack.ProgressPlugin(),
      new webpack.DefinePlugin({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __VUE_OPTIONS_API__: false,
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
  },
]
