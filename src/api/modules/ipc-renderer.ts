import type { IpcRendererHandler, IpcRendererListener, RendererCommands, RendererEventDefinitions } from '@commas/electron-ipc'
import { ipcRenderer } from '@commas/electron-ipc'
import { injectIPC } from '../../renderer/utils/composables'
import { handleRenderer, useListener } from '../../renderer/utils/ipc'
import type { RendererAPIContext } from '../types'

function on<
  K extends keyof RendererEventDefinitions,
>(this: RendererAPIContext, channel: K, listener: IpcRendererListener<RendererEventDefinitions[K]>) {
  ipcRenderer.on(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

function handle<
  K extends keyof RendererCommands,
>(
  this: RendererAPIContext,
  channel: K,
  listener: IpcRendererHandler<RendererCommands[K]>,
) {
  const { dispose } = handleRenderer(channel, listener)
  this.$.app.onInvalidate(dispose)
}

export * from '../shim'

export {
  on,
  injectIPC as inject,
  handle,
  useListener,
}
