const packager = require('electron-packager')
const png2icons = require('png2icons')
const fs = require('fs')
const childProcess = require('child_process')
const util = require('util')
const app = require('./package.json')

const execa = util.promisify(childProcess.exec)

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
    console.info(`Generating ${suffix.toUpperCase()} icon for application...`)
    const builder = suffix === 'icns' ? png2icons.createICNS : png2icons.createICO
    const output = builder(input, png2icons.BICUBIC2, 0, false, true)
    await fs.promises.writeFile(iconPath, output)
  } catch {
    // ignore error
  }
}

const options = {
  dir: '.',
  platform: 'all',
  executableName: process.platform === 'win32'
    ? app.name : app.productName,
  out: 'dist/',
  overwrite: true,
  asar: true,
  icon: 'resources/images/icon',
  ignore: [
    '^/(?!addons|api|main|node_modules|renderer|resources|package\\.json)',
    '^/resources/.*\\.(ico|icns)$',
    '^/renderer/(?!build|index\\.html)$',
  ],
  appVersion: app.version,
  appCopyright: [
    'Copyright \u00a9', new Date().getFullYear(), app.author,
  ].join(' '),
  appCategoryType: 'public.app-category.developer-tools',
  extendInfo: {
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

async function copyWindowsManifest(dir) {
  try {
    console.info(`Copying Visual Elements Manifest for Windows...`)
    const manifest = `${app.name}.VisualElementsManifest.xml`
    await fs.promises.copyFile(`resources/${manifest}`, `${dir}/${manifest}`)
  } catch {
    // ignore error
  }
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
      timestamp: 'none',
    }
  }
  // Run electron-packager
  const appPaths = await packager(options)
  await Promise.all(
    appPaths.map(async dir => {
      if (dir.includes('win32')) {
        await copyWindowsManifest(dir)
      }
    })
  )
  return Date.now() - startedAt
}

make().then(
  duration => console.info(`Build finished after ${duration / 1000}s.`),
  err => console.error(err),
)
