import type { ReactiveEffect } from '@vue/reactivity'
import { customRef, stop, unref } from '@vue/reactivity'
import { useSettings } from '../../lib/settings'
import { execa } from '../../utils/helper'
import { useEffect } from '../../utils/hooks'

async function createServer(cancelation?: Promise<unknown>) {
  const settings = unref(useSettings())
  const port: number = settings['proxy.server.port']
  if (cancelation) await cancelation
  return execa(`whistle start -p ${port}`)
}

async function closeServer() {
  return execa('whistle stop')
}

const serverStatusRef = customRef<boolean | undefined>((track, trigger) => {
  let status: boolean | undefined = false
  let cancelation: Promise<unknown> | undefined
  let serverEffect: ReactiveEffect<void>
  const createEffect = () => useEffect(async (onInvalidate) => {
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
}
