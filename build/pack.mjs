import childProcess from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv, promisify, styleText } from 'node:util'
import { packager } from '@electron/packager'
import { rebuild } from '@electron/rebuild'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import png2icons from 'png2icons'
import pkg from '../package.json' with { type: 'json' }

const pkgPath = fileURLToPath(import.meta.resolve('../package.json'))
const backupPkgPath = path.relative(path.dirname(pkgPath), '.package.json')

const execa = promisify(childProcess.exec)

const logger = {
  /**
   * @param {string} message
   */
  info(message) {
    console.log(styleText(['inverse', 'blue'], ' INFO ') + ' ' + message)
  },
  /**
   * @param {string} message
   */
  done(message) {
    console.log(styleText(['inverse', 'green'], ' DONE ') + ' ' + message)
  },
  /**
   * @param {string} message
   */
  warn(message) {
    console.log(styleText(['inverse', 'yellow'], ' WARN ') + ' ' + message)
  },
  /**
   * @param {string} message
   */
  error(message) {
    console.error(styleText(['inverse', 'red'], ' ERROR ') + ' ' + message)
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
  const workspacePkgs = await findWorkspacePackages(path.dirname(pkgPath))
  const prunePkg = {
    ...pkg,
    devDependencies: Object.assign(
      {},
      ...workspacePkgs.map(workspace => workspace.manifest.devDependencies),
      pkg.devDependencies,
    ),
    dependencies: Object.assign(
      {},
      ...workspacePkgs.map(workspace => workspace.manifest.dependencies),
      pkg.dependencies,
    ),
  }
  await fs.promises.copyFile(pkgPath, backupPkgPath)
  await fs.promises.writeFile(pkgPath, JSON.stringify(prunePkg, null, 2) + '\n')
  return () => fs.promises.rename(backupPkgPath, pkgPath)
}

async function loadEnv() {
  const file = fileURLToPath(import.meta.resolve('../.env'))
  try {
    const content = await fs.promises.readFile(file, 'utf8')
    return parseEnv(content)
  } catch {
    return {}
  }
}

/**
 * @type {import('@electron/packager').Options}
 */
const options = {
  dir: '.',
  executableName: process.platform === 'win32'
    ? pkg.name : pkg.productName,
  out: 'release/',
  overwrite: true,
  asar: process.env.DEBUG ? false : {
    unpack: '**/*.node',
  },
  icon: 'resources/images/icon.png',
  ignore: [
    /^\/(?!addons|dist|node_modules|resources|package\.json)/,
    /^\/addons\/[^/]+\/(node_modules|src)/,
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
    async ({ buildPath, electronVersion, platform, arch }) => {
      await rebuild({ buildPath, electronVersion, platform, arch })
    },
    async ({ buildPath, electronVersion, platform, arch }) => {
      await fs.promises.rm(path.join(buildPath, 'node_modules/@commas'), { recursive: true })
    },
  ],
  afterPrune: [
    async ({ buildPath, electronVersion, platform, arch }) => {
      await fs.promises.copyFile(backupPkgPath, path.join(buildPath, 'package.json'))
    },
  ],
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
 * @param {import('@electron/packager').Options} packagerOptions
 * @param {import('@electron/packager').TargetDefinition[]} [targets]
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
  if (local) {
    delete options.platform
    delete options.arch
  } else {
    const env = await loadEnv()
    if (
      env.APPLE_ID
      && env.APPLE_ID_PASSWORD
      && env.APPLE_TEAM_ID
    ) {
      logger.info('Will sign and notarize for macOS')
      options.osxSign = {}
      options.osxNotarize = {
        appleId: env.APPLE_ID,
        appleIdPassword: env.APPLE_ID_PASSWORD,
        teamId: env.APPLE_TEAM_ID,
      }
    }
  }
  // Run @electron/packager
  const restorePackage = await resolveWorkspacePackages()
  let appPaths
  try {
    appPaths = await runPackager(options, local ? undefined : [
      { arch: 'arm64', platform: 'darwin' },
      { arch: 'x64', platform: 'darwin' },
      // { arch: 'x64', platform: 'linux' },
      // { arch: 'x64', platform: 'win32' },
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
    logger.error(err.stack)
  },
)
