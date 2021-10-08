const childProcess = require('child_process')
const path = require('path')
const buildMain = require('./build-main')
const buildRenderer = require('./build-renderer')

const electron = require.resolve('electron/cli.js')
const versionScript = path.resolve(__dirname, 'electron-versions.js')
const versions = JSON.parse(
  childProcess.execSync(`${electron} ${versionScript}`).toString(),
)

buildMain(versions)
buildRenderer(versions)
