import fs from 'fs'
import os from 'os'
import path from 'path'
import { unref } from '@vue/reactivity'
import * as commas from 'commas:api/main'

async function installRootCA() {
  const settings = unref(commas.settings.useSettings())
  const port = settings['proxy.server.port']
  const cert = path.join(os.tmpdir(), `whistle-root-ca.${Date.now()}.cert`)
  await commas.shell.downloadFile(`http://localhost:${port}/cgi-bin/rootca`, cert)
  await commas.shell.sudoExecute(`security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${cert}`)
  await fs.promises.unlink(cert)
}

function uninstallRootCA() {
  return commas.shell.sudoExecute('security delete-certificate -c whistle.')
}

async function checkRootCA() {
  try {
    await commas.shell.execute('security find-certificate -c whistle.')
    return true
  } catch {
    return false
  }
}

export {
  installRootCA,
  uninstallRootCA,
  checkRootCA,
}
