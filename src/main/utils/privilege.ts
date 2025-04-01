import * as path from 'node:path'
import * as sudo from '@vscode/sudo-prompt'
import { app } from 'electron'

const sudoExecute = (command: string) => {
  return new Promise((resolve, reject) => {
    sudo.exec(command, {
      name: app.name,
      icns: process.platform === 'darwin'
        ? path.join(app.getPath('exe'), '../../Resources/electron.icns')
        : undefined,
    }, (err, stdout, stderr) => {
      if (err) {
        reject(Object.assign(err, { stdout, stderr }))
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

export {
  sudoExecute,
}
