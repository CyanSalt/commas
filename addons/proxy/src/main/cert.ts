import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import * as stream from 'node:stream'
import * as commas from 'commas:api/main'

async function installRootCA() {
  const settings = commas.settings.useSettings()
  const port = settings['proxy.server.port']!
  const cert = path.join(os.tmpdir(), `whistle-root-ca.${Date.now()}.cert`)
  const response = await fetch(`http://localhost:${port}/cgi-bin/rootca`)
  await stream.promises.pipeline(
    stream.Readable.fromWeb(response.body as never),
    fs.createWriteStream(cert),
  )
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
