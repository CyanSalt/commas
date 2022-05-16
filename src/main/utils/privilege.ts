import * as path from 'path'
import { app } from 'electron'
import * as sudo from 'sudo-prompt'

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
