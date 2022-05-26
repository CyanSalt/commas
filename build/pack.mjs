import childProcess from 'child_process'
import fs from 'fs'
import path from 'path'
import util from 'util'
import chalk from 'chalk'
import packager from 'electron-packager'
import png2icons from 'png2icons'
import { requireCommonJS } from './utils/common.mjs'

const app = requireCommonJS(import.meta, '../package.json')

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

/**
 * @type {import('electron-packager').Options}
 */
const options = {
  dir: '.',
  platform: ['darwin', 'linux', 'win32'],
  executableName: process.platform === 'win32'
    ? app.name : app.productName,
  out: 'release/',
  overwrite: true,
  asar: true,
  icon: 'resources/images/icon',
  ignore: [
    '^/(?!addons|dist|node_modules|resources|package\\.json)',
    '^/addon/[^/]+/src',
    '^/resources/.*\\.(ico|icns)$',
  ],
  extraResource: [
    'bin',
  ],
  appVersion: app.version,
  appCopyright: [
    'Copyright \u00a9', new Date().getFullYear(), app.author,
  ].join(' '),
  appCategoryType: 'public.app-category.developer-tools',
  protocols: [
    {
      name: app.productName,
      schemes: ['commas'],
    },
  ],
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
  afterCopy: [
    (buildPath, electronVersion, platform, arch, callback) => {
      fs.rm(path.join(buildPath, 'node_modules/@commas'), { recursive: true }, callback)
    },
  ],
}

async function getMacOSCodeSign(name) {
  const { stdout } = await execa(
    `security find-identity -p codesigning -v | grep -o "\\"${name}: .*\\""`,
  )
  return stdout.toString().trim()
}

async function compressPackage(dir) {
  logger.info(`Packing ${dir}...`)
  try {
    await fs.promises.unlink(`${dir}.zip`)
  } catch {
    // ignore error
  }
  return execa(`zip -ry ${dir}.zip ${dir}/`)
}

async function pack() {
  const local = process.argv.includes('--local')
  // Generate icons
  const startedAt = Date.now()
  const input = await fs.promises.readFile(`${options.icon}.png`)
  await Promise.all([
    generateAppIcon(input, options.icon, 'ico'),
    generateAppIcon(input, options.icon, 'icns'),
  ])
  // Equivalent to { type: 'development' } for electron-osx-sign
  if (process.platform === 'darwin') {
    options.osxSign = {
      identity: await getMacOSCodeSign('Apple Development'),
      'gatekeeper-assess': false,
    }
  }
  if (local) {
    delete options.platform
  }
  // Run electron-packager
  const appPaths = await packager(options)
  if (!local) {
    const cwd = process.cwd()
    process.chdir(options.out)
    await Promise.all(
      appPaths.map(dir => compressPackage(path.relative(options.out, dir))),
    )
    process.chdir(cwd)
  }
  return Date.now() - startedAt
}

pack().then(
  duration => {
    logger.done(`Build finished after ${duration / 1000}s.`)
  },
  err => {
    logger.error(err)
  },
)
