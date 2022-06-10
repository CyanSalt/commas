import * as path from 'path'
import { computed, customRef, stop, unref } from '@vue/reactivity'
import type { ReactiveEffectRunner } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { app } from 'electron'
import * as pkg from 'whistle/package.json'

const builtinWhistlePath = path.join(path.dirname(require.resolve('whistle/package.json')), pkg.bin.whistle)

const builtinServerVersionInfo = {
  type: 'builtin' as const,
  version: pkg.version,
}

const settings = commas.settings.useSettings()

const whistlePathRef = commas.helperMain.useAsyncComputed(async () => {
  const whistlePath = settings['proxy.server.whistle']
  if (!whistlePath) return builtinWhistlePath
  if (path.isAbsolute(whistlePath)) return whistlePath
  try {
    await commas.shell.loginExecute(`command -v ${whistlePath}`)
    return whistlePath
  } catch {
    return builtinWhistlePath
  }
}, builtinWhistlePath)

const isUsingBuiltinWhistleRef = computed(() => {
  const whistlePath = unref(whistlePathRef)
  return whistlePath === builtinWhistlePath
})

function whistle(command: string) {
  const whistlePath = unref(whistlePathRef)
  const isUsingBuiltinWhistle = unref(isUsingBuiltinWhistleRef)
  if (!path.isAbsolute(whistlePath)) {
    return commas.shell.loginExecute(`${whistlePath} ${command}`)
  }
  if (isUsingBuiltinWhistle) {
    const bin = app.getPath('exe')
    const env = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      STARTING_EXEC_PATH: bin,
    }
    return commas.shell.execute(`${bin} ${whistlePath} ${command}`, { env })
  }
  return commas.shell.execute(`${whistlePath} ${command}`)
}

function createServer(port: number) {
  return whistle(`start -p ${port}`)
}

function closeServer() {
  return whistle('stop')
}

async function getProxyServerVersion() {
  try {
    const { stdout } = await whistle('-V')
    return stdout.trim()
  } catch {
    return null
  }
}

async function getLatestProxyServerVersion() {
  try {
    const data = await commas.shell.requestJSON('https://registry.npmjs.org/whistle/latest')
    return data.version
  } catch {
    return null
  }
}

const serverVersionInfoRef = commas.helperMain.useAsyncComputed(async () => {
  const isUsingBuiltinWhistle = unref(isUsingBuiltinWhistleRef)
  if (isUsingBuiltinWhistle) return builtinServerVersionInfo
  return {
    type: 'external' as const,
    version: await getProxyServerVersion(),
  }
}, builtinServerVersionInfo)

function useProxyServerVersionInfo() {
  return serverVersionInfoRef
}

const serverStatusRef = customRef<boolean | undefined>((track, trigger) => {
  let status: boolean | undefined = false
  let processing: Promise<unknown> | undefined
  let serverEffect: ReactiveEffectRunner | undefined
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
      await processing
      status = value
      trigger()
    } catch {
      status = oldStatus
      trigger()
    } finally {
      processing = undefined
    }
  }
  const createEffect = () => commas.helperMain.useEffect((onInvalidate) => {
    const port = settings['proxy.server.port']!
    toggle(true, () => createServer(port))
    onInvalidate(() => {
      toggle(false, () => closeServer())
    })
  })
  return {
    get() {
      track()
      return status
    },
    set(value) {
      if (status === value) return
      if (serverEffect) {
        stop(serverEffect)
        serverEffect = undefined
      }
      if (value) {
        serverEffect = createEffect()
      }
    },
  }
})

function useProxyServerStatus() {
  return serverStatusRef
}

export {
  whistle,
  getLatestProxyServerVersion,
  useProxyServerVersionInfo,
  useProxyServerStatus,
}
