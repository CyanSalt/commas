import * as path from 'node:path'
import * as commas from 'commas:api/main'

const settings = commas.settings.useSettings()

async function whistle(command: string) {
  const whistlePath = settings['proxy.server.whistle']
  if (!whistlePath) {
    throw new Error('Command "whistle" not found')
  }
  if (!path.isAbsolute(whistlePath)) {
    return commas.shell.loginExecute(`${whistlePath} ${command}`)
  }
  return commas.shell.execute(`${whistlePath} ${command}`)
}

function createServer(port: number) {
  return whistle(`start -p ${port}`)
}

function closeServer() {
  return whistle('stop')
}

async function getProxyServerStatus() {
  try {
    const { stdout } = await whistle('status')
    return stdout.trim().includes(' is running')
  } catch {
    return undefined
  }
}

async function getProxyServerVersion() {
  try {
    const { stdout } = await whistle('-V')
    return stdout.trim()
  } catch {
    return undefined
  }
}

async function getLatestProxyServerVersion() {
  try {
    const data = await commas.shell.requestJSON('https://registry.npmjs.org/whistle/latest')
    return data.version
  } catch {
    return undefined
  }
}

const serverInstalled = $(commas.helper.useAsyncComputed(async () => {
  try {
    await whistle('help')
    return true
  } catch {
    return false
  }
}, true))

function useProxyServerInstalled() {
  return $$(serverInstalled)
}

const serverVersion = $(commas.helper.useAsyncComputed(async () => {
  return getProxyServerVersion()
}))

function useProxyServerVersion() {
  return $$(serverVersion)
}

const serverStatus = $customRef<boolean | undefined>((track, trigger) => {
  let status: boolean | undefined
  let processing: Promise<unknown> | undefined
  let stopServer: (() => void) | undefined
  let running: {}
  const toggle = async (value: boolean, fn: () => Promise<unknown>) => {
    const current = {}
    running = current
    const oldStatus = status
    try {
      if (processing) {
        await processing
        if (running !== current) return
      }
      status = undefined
      trigger()
      processing = fn()
      const result = await processing
      status = typeof result === 'boolean' ? result : value
      trigger()
    } catch {
      status = oldStatus
      trigger()
    } finally {
      processing = undefined
    }
  }
  const startServer = () => commas.helper.watchBaseEffect((onInvalidate) => {
    const port = settings['proxy.server.port']!
    toggle(true, () => createServer(port).then(() => undefined))
    onInvalidate(() => {
      toggle(false, () => closeServer().then(() => undefined))
    })
  })
  return {
    get() {
      track()
      if (status === undefined) {
        toggle(false, () => getProxyServerStatus())
      }
      return status
    },
    set(value) {
      if (status === value) return
      if (stopServer) {
        stopServer()
        stopServer = undefined
      }
      if (value) {
        stopServer = startServer()
      }
    },
  }
})

function useProxyServerStatus() {
  return $$(serverStatus)
}

export {
  getLatestProxyServerVersion,
  useProxyServerInstalled,
  useProxyServerVersion,
  useProxyServerStatus,
}
