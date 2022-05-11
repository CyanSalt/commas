// Equivalent with bash command:
// sed -i "" "s/^target=.*/target=$(npm list electron --depth=0 | sed -n \'2p\' | cut -d @ -f 2)/g" .npmrc
const fs = require('fs')
const electron = require('electron/package.json')

const rcFile = '.npmrc'

const content = fs.readFileSync(rcFile, 'utf8')
  .replace(/^(target=).*$/m, `$1${electron.version}`)
fs.writeFileSync(rcFile, content)
