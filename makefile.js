/* eslint-disable no-console */
const packager = require('electron-packager')
const png2icons = require('png2icons')
const path = require('path')
const fs = require('fs')
const app = require('./package.json')

const suffix = process.platform === 'darwin' ? 'icns' : 'ico'
let iconPath = `src/assets/images/icon.${suffix}`

// Check icon file
try {
  fs.accessSync(iconPath)
} catch (err) {
  const folder = path.dirname(iconPath)
  try {
    const input = fs.readFileSync(`${folder}/icon.png`)
    console.log('Generating program icon...')
    const builder = suffix === 'icns' ? png2icons.createICNS : png2icons.createICO
    const output = builder(input, png2icons.BICUBIC2, 0, false, true)
    fs.writeFileSync(iconPath, output)
  } catch (err) {
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
    '^/node_modules/@.*$',
    '^/(?!src|node_modules|package\\.json|window\\.js)',
    '^/src/(components|plugins|store|vendors)($|/)',
    '^/src/assets/.*\\.(ico|icns)$',
  ],
  appVersion: app.version,
  appCopyright: [
    'Copyright \u00a9', new Date().getFullYear(), app.author,
  ].join(' '),
  appCategoryType: 'public.app-category.developer-tools',
  win32metadata: {
    FileDescription: app.productName,
    OriginalFilename: `${app.name}.exe`,
  },
}

packager(options).then(appPaths => {
  appPaths.forEach(dir => {
    if (dir.includes('win32')) {
      try {
        const manifest = `${app.name}.VisualElementsManifest.xml`
        fs.copyFileSync(`src/assets/${manifest}`,
          `${dir}/${manifest}`)
      } catch (err) {
        // ignore error
      }
    }
  })
  console.log('Build finished.')
}).catch(e => {
  console.error(e)
})
