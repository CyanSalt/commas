import fs from 'fs'
import os from 'os'
import path from 'path'
import { unref } from '@vue/reactivity'
import * as commas from 'commas:api/main'
// TODO: make these shareable
import { execa } from '../../../../main/utils/helper'
import { downloadFile } from '../../../../main/utils/net'
import { sudo } from '../../../../main/utils/privilege'

async function installRootCA() {
  const settings = unref(commas.settings.useSettings())
  const port = settings['proxy.server.port']
  const cert = path.join(os.tmpdir(), `whistle-root-ca.${Date.now()}.cert`)
  await downloadFile(`http://localhost:${port}/cgi-bin/rootca`, cert)
  await sudo(`security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${cert}`)
  await fs.promises.unlink(cert)
}

function uninstallRootCA() {
  return sudo('security delete-certificate -c whistle.')
}

async function checkRootCA() {
  try {
    await execa('security find-certificate -c whistle.')
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
