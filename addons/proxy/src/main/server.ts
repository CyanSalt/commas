import { customRef, stop } from '@vue/reactivity'
import type { ReactiveEffectRunner } from '@vue/reactivity'
import * as commas from 'commas:api/main'

async function createServer(cancelation?: Promise<unknown>) {
  const settings = commas.settings.useSettings()
  const port: number = settings['proxy.server.port']
  if (cancelation) {
    await cancelation
  }
  return commas.shell.loginExecute(`whistle start -p ${port}`)
}

function closeServer() {
  return commas.shell.loginExecute('whistle stop')
}

async function getProxyServerVersion() {
  try {
    const { stdout } = await commas.shell.loginExecute('whistle -V')
    return stdout.trim()
  } catch {
    return null
  }
}

async function getLatestProxyServerVersion() {
  try {
    const { stdout } = await commas.shell.loginExecute('npm view whistle version')
    return stdout.trim()
  } catch {
    return null
  }
}

function installProxyServer() {
  return commas.shell.loginExecute('npm install -g whistle')
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
  installProxyServer,
}
