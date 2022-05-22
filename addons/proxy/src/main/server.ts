import * as path from 'path'
import { customRef, stop, unref } from '@vue/reactivity'
import type { ReactiveEffectRunner } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { app } from 'electron'
import * as pkg from 'whistle/package.json'

const builtinWhistlePath = path.join(path.dirname(require.resolve('whistle/package.json')), pkg.bin.whistle)

const whistlePathRef = commas.helperMain.useAsyncComputed(async () => {
  const settings = commas.settings.useSettings()
  const whistlePath = settings['proxy.server.whistle']
  if (!whistlePath) return builtinWhistlePath
  if (path.isAbsolute(whistlePath)) return whistlePath
  try {
    await commas.shell.execute(`command -v ${whistlePath}`)
    return whistlePath
  } catch {
    return builtinWhistlePath
  }
}, builtinWhistlePath)

function whistle(command: string) {
  const whistlePath = unref(whistlePathRef)
  if (!path.isAbsolute(whistlePath)) {
    return commas.shell.loginExecute(`${whistlePath} ${command}`)
  }
  if (whistlePath === builtinWhistlePath) {
    const bin = app.getPath('exe')
    const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
    return commas.shell.execute(`${bin} ${whistlePath} ${command}`, { env })
  }
  return commas.shell.execute(`${whistlePath} ${command}`)
}

async function createServer(cancelation?: Promise<unknown>) {
  const settings = commas.settings.useSettings()
  const port: number = settings['proxy.server.port']
  if (cancelation) {
    await cancelation
  }
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

const serverStatusRef = customRef<boolean | undefined>((track, trigger) => {
  let status: boolean | undefined = false
  let cancelation: Promise<unknown> | undefined
  let serverEffect: ReactiveEffectRunner
  const createEffect = () => commas.helperMain.useEffect(async (onInvalidate) => {
    const server = createServer(cancelation)
    onInvalidate(async () => {
      cancelation = closeServer()
      const oldStatus = status
      try {
        status = undefined
        trigger()
        await cancelation
        status = false
        trigger()
      } catch {
        status = oldStatus
        trigger()
      }
    })
    const oldStatus = status
    try {
      status = undefined
      trigger()
      await server
      status = true
      trigger()
    } catch {
      status = oldStatus
      trigger()
    }
  })
  return {
    get() {
      track()
      return status
    },
    set(value) {
      if (status === value) return
      if (value) {
        serverEffect = createEffect()
      } else {
        stop(serverEffect)
      }
    },
  }
})

function useProxyServerStatus() {
  return serverStatusRef
}

export {
  useProxyServerStatus,
  getProxyServerVersion,
  getLatestProxyServerVersion,
}
