import { app } from 'electron'
import * as sudo from 'sudo-prompt'
import { resources } from '../utils/directory'

const sudoExeca = (command: string) => {
  return new Promise((resolve, reject) => {
    sudo.exec(command, {
      name: app.name,
      icns: resources.file('images/icon.icns'),
    }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stdout, stderr }))
      else resolve({ stdout, stderr })
    })
  })
}

export {
  sudoExeca as sudo,
}
