import childProcess from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import { rebuild } from '@electron/rebuild'
import chalk from 'chalk'
import packager from 'electron-packager'
import png2icons from 'png2icons'
import { requireCommonJS, resolveCommonJS } from './utils/common.mjs'

const pkg = requireCommonJS(import.meta, '../package.json')
const pkgPath = resolveCommonJS(import.meta, '../package.json')
const backupPkgPath = path.relative(path.dirname(pkgPath), '.package.json')

const execa = util.promisify(childProcess.exec)

const logger = {
  /**
   * @param {string} message
   */
  info(message) {
    console.log(chalk.inverse(chalk.blue(' INFO ')) + ' ' + message)
  },
  /**
   * @param {string} message
   */
  done(message) {
    console.log(chalk.inverse(chalk.green(' DONE ')) + ' ' + message)
  },
  /**
   * @param {string} message
   */
  warn(message) {
    console.log(chalk.inverse(chalk.yellow(' WARN ')) + ' ' + chalk.yellow(message))
  },
  /**
   * @param {string} message
   */
  error(message) {
    console.error(chalk.inverse(chalk.red(' ERROR ')) + ' ' + chalk.red(message))
  },
}

/**
 * @param {Buffer} input
 * @param {string} icon
 * @param {string} suffix
 */
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
    if (output) {
      await fs.promises.writeFile(iconPath, output)
    }
  } catch {
    // ignore error
  }
}

async function resolveWorkspacePackages() {
  const workspacePkgs = pkg.workspaces
    .map(dir => requireCommonJS(import.meta, path.join(path.dirname(pkgPath), dir, 'package.json')))
  const prunePkg = {
    ...pkg,
    devDependencies: Object.assign(
      {},
      ...workspacePkgs.map(workspace => workspace.devDependencies),
      pkg.devDependencies,
    ),
    dependencies: Object.assign(
      {},
      ...workspacePkgs.map(workspace => workspace.dependencies),
      pkg.dependencies,
    ),
  }
  await fs.promises.copyFile(pkgPath, backupPkgPath)
  await fs.promises.writeFile(pkgPath, JSON.stringify(prunePkg, null, 2) + '\n')
  return () => fs.promises.rename(backupPkgPath, pkgPath)
}

/**
 * @type {import('electron-packager').Options}
 */
const options = {
  dir: '.',
  executableName: process.platform === 'win32'
    ? pkg.name : pkg.productName,
  out: 'release/',
  overwrite: true,
  asar: process.env.DEBUG ? false : {
    // FIXME: node-pty does not support app.asar.unpacked currently
    unpack: '**/{*.node,node_modules/node-pty/**/*}',
  },
  icon: 'resources/images/icon.png',
  ignore: [
    /^\/(?!addons|dist|node_modules|resources|package\.json)/,
    /^\/addon\/[^/]+\/src/,
    /^\/resources\/.*\.(ico|icns)$/,
  ],
  extraResource: [
    'bin',
  ],
  appVersion: pkg.version,
  appCopyright: [
    'Copyright \u00a9', new Date().getFullYear(), pkg.author,
  ].join(' '),
  appCategoryType: 'public.app-category.developer-tools',
  protocols: [
    {
      name: pkg.productName,
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
    FileDescription: pkg.productName,
    OriginalFilename: `${pkg.name}.exe`,
  },
  afterCopy: [
    (buildPath, electronVersion, platform, arch, callback) => {
      util.callbackify(rebuild)({ buildPath, electronVersion, arch }, callback)
    },
    (buildPath, electronVersion, platform, arch, callback) => {
      fs.rm(path.join(buildPath, 'node_modules/@commas'), { recursive: true }, callback)
    },
  ],
  afterPrune: [
    (buildPath, electronVersion, platform, arch, callback) => {
      util.callbackify(() => Promise.all([
        fs.promises.rm(path.join(buildPath, 'node_modules/node-pty/build/node_gyp_bins'), { force: true, recursive: true }),
        fs.promises.copyFile(backupPkgPath, path.join(buildPath, 'package.json')),
      ]))(callback)
    },
  ],
}

/**
 * @param {string} name
 */
async function getMacOSCodeSign(name) {
  const { stdout } = await execa(
    `security find-identity -p codesigning -v | grep "\\"${name}: .*\\"" | cut -d ' ' -f 4`,
  )
  const sign = stdout.trim()
  if (!/^[0-9A-Fa-f]{40}$/.test(sign)) {
    throw new Error(`Invalid code sign: ${sign}`)
  }
  return sign
}

/**
 * @param {string} dir
 */
async function compressPackage(dir) {
  logger.info(`Packing ${dir}...`)
  try {
    await fs.promises.unlink(`${dir}.zip`)
  } catch {
    // ignore error
  }
  return execa(`zip -ry ${dir}.zip ${dir}/`)
}

/**
 * @param {import('electron-packager').Options} packagerOptions
 * @param {import('electron-packager').TargetDefinition[]} [targets]
 */
async function runPackager(packagerOptions, targets) {
  const { arch, platform, ...others } = packagerOptions
  if (targets) {
    const paths = await Promise.all(targets.map(target => {
      return packager({ ...target, ...others })
    }))
    return paths.flat()
  } else {
    return packager(others)
  }
}

async function pack() {
  const local = process.argv.includes('--local')
  // Generate icons
  const startedAt = Date.now()
  if (options.icon) {
    const extname = path.extname(options.icon)
    if (extname === '.png') {
      const input = await fs.promises.readFile(options.icon)
      const icon = path.join(path.dirname(options.icon), path.basename(options.icon, extname))
      await Promise.all([
        generateAppIcon(input, icon, 'ico'),
        generateAppIcon(input, icon, 'icns'),
      ])
      options.icon = icon
    }
  }
  // Equivalent to { type: 'development' } for electron-osx-sign
  if (process.platform === 'darwin') {
    options.osxSign = {
      identity: await getMacOSCodeSign('Apple Development'),
    }
  }
  if (local) {
    delete options.platform
    delete options.arch
  }
  // Run electron-packager
  const restorePackage = await resolveWorkspacePackages()
  let appPaths
  try {
    appPaths = await runPackager(options, local ? undefined : [
      { arch: 'x64', platform: 'darwin' },
      { arch: 'x64', platform: 'linux' },
      { arch: 'x64', platform: 'win32' },
      { arch: 'arm64', platform: 'darwin' },
    ])
  } finally {
    await restorePackage()
  }
  if (!local) {
    const cwd = process.cwd()
    if (options.out) {
      const outDir = options.out
      process.chdir(outDir)
      await Promise.all(
        appPaths.map(dir => compressPackage(path.relative(outDir, dir))),
      )
      process.chdir(cwd)
    }
  }
  return Date.now() - startedAt
}

pack().then(
  duration => {
    logger.done(`Build finished after ${duration / 1000}s.`)
  },
  err => {
    process.exitCode = 1
    logger.error(err)
  },
)
