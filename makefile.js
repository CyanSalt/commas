const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')
const chalk = require('chalk')
const packager = require('electron-packager')
const png2icons = require('png2icons')
const app = require('./package.json')

const execa = util.promisify(childProcess.exec)

const logger = {
  info(message) {
    console.log(chalk.inverse(chalk.blue(' INFO ')) + ' ' + message)
  },
  done(message) {
    console.log(chalk.inverse(chalk.green(' DONE ')) + ' ' + message)
  },
  warn(message) {
    console.log(chalk.inverse(chalk.yellow(' WARN ')) + ' ' + chalk.yellow(message))
  },
  error(message) {
    console.error(chalk.inverse(chalk.red(' ERROR ')) + ' ' + chalk.red(message))
  },
}

async function generateAppIcon(input, icon, suffix) {
  // Check icon file
  const iconPath = `${icon}.${suffix}`
  try {
    await fs.promises.access(iconPath)
    return
  } catch {
    // ignore error
  }
  try {
    logger.info(`Generating ${suffix.toUpperCase()} icon for application...`)
    const builder = suffix === 'icns' ? png2icons.createICNS : png2icons.createICO
    const output = builder(input, png2icons.BICUBIC2, 0, false, true)
    await fs.promises.writeFile(iconPath, output)
  } catch {
    // ignore error
  }
}

const options = {
  dir: '.',
  platform: ['darwin', 'linux', 'win32'],
  executableName: process.platform === 'win32'
    ? app.name : app.productName,
  out: 'dist/',
  overwrite: true,
  asar: true,
  icon: 'resources/images/icon',
  ignore: [
    '^/(?!addons|main|node_modules|renderer|resources|package\\.json)',
    '^/main/(?!dist)$',
    '^/renderer/(?!dist|index\\.html)$',
    '^/resources/.*\\.(ico|icns)$',
  ],
  appVersion: app.version,
  appCopyright: [
    'Copyright \u00a9', new Date().getFullYear(), app.author,
  ].join(' '),
  appCategoryType: 'public.app-category.developer-tools',
  extendInfo: {
    CFBundleDocumentTypes: [
      {
        CFBundleTypeIconFile: [],
        CFBundleTypeName: 'directory',
        CFBundleTypeRole: 'Shell',
        LSHandlerRank: 'Alternate',
        LSItemContentTypes: ['public.folder'],
      },
    ],
    NSUserNotificationAlertStyle: 'alert',
  },
  win32metadata: {
    FileDescription: app.productName,
    OriginalFilename: `${app.name}.exe`,
  },
}

async function getMacOSCodeSign(name) {
  const { stdout } = await execa(
    `security find-identity -p codesigning -v | grep -o "\\"${name}: .*\\""`
  )
  return stdout.toString().trim()
}

async function compressPackage(dir) {
  logger.info(`Packing ${path.basename(dir)}...`)
  try {
    await fs.promises.unlink(`${dir}.zip`)
  } catch {
    // ignore error
  }
  return execa(`zip -ry ${dir}.zip ${dir}/`)
}

async function make() {
  // Generate icons
  const startedAt = Date.now()
  const input = await fs.promises.readFile(`${options.icon}.png`)
  await Promise.all([
    generateAppIcon(input, options.icon, 'ico'),
    generateAppIcon(input, options.icon, 'icns'),
  ])
  // Equivalent to {type: 'development'} for electron-osx-sign
  if (process.platform === 'darwin') {
    options.osxSign = {
      identity: await getMacOSCodeSign('Apple Development'),
      'gatekeeper-assess': false,
    }
  }
  // Run electron-packager
  const appPaths = await packager(options)
  await Promise.all(
    appPaths.map(dir => compressPackage(dir))
  )
  return Date.now() - startedAt
}

make().then(
  duration => {
    logger.done(`Build finished after ${duration / 1000}s.`)
  },
  err => {
    logger.error(err)
  },
)
