/* eslint-disable no-console */
const packager = require('electron-packager')
const png2icons = require('png2icons')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const app = require('./package.json')

const suffix = process.platform === 'darwin' ? 'icns' : 'ico'
let iconPath = `assets/images/icon.${suffix}`

// Check icon file
try {
  fs.accessSync(iconPath)
} catch {
  const folder = path.dirname(iconPath)
  try {
    const input = fs.readFileSync(`${folder}/icon.png`)
    console.log('Generating program icon...')
    const builder = suffix === 'icns' ? png2icons.createICNS : png2icons.createICO
    const output = builder(input, png2icons.BICUBIC2, 0, false, true)
    fs.writeFileSync(iconPath, output)
  } catch {
    iconPath = null
  }
}

const options = {
  dir: '.',
  name: process.platform === 'win32' ?
    app.name : app.productName,
  out: 'dist/',
  overwrite: true,
  asar: true,
  icon: iconPath,
  ignore: [
    '^/(?!assets|app|node_modules|package\\.json)',
    '^/assets/.*\\.(ico|icns)$',
    '^/src/(?!build|index\\.html)$',
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

// equivalent to {type: 'development'} for electron-osx-sign
if (process.platform === 'darwin') {
  options.osxSign = {
    identity: childProcess.execSync(
      'security find-identity -p codesigning -v | grep -o "\\"Apple Development: .*\\""'
    ).toString().trim(),
  }
}

packager(options).then(appPaths => {
  appPaths.forEach(dir => {
    if (dir.includes('win32')) {
      try {
        const manifest = `${app.name}.VisualElementsManifest.xml`
        fs.copyFileSync(`assets/${manifest}`,
          `${dir}/${manifest}`)
      } catch {
        // ignore error
      }
    }
  })
  console.log('Build finished.')
}).catch(e => {
  console.error(e)
})
