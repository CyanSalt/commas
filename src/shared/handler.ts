import type { GlobalCommands } from '@commas/electron-ipc'

const globalHandler = {

  handlers: new Map<keyof GlobalCommands, {
    listener: GlobalCommands[keyof GlobalCommands],
    once?: boolean,
  }>(),

  handle<K extends keyof GlobalCommands>(channel: K, listener: GlobalCommands[K]) {
    this.handlers.set(channel, { listener })
  },

  handleOnce<K extends keyof GlobalCommands>(channel: K, listener: GlobalCommands[K]) {
    this.handlers.set(channel, { listener, once: true })
  },

  removeHandler<K extends keyof GlobalCommands>(channel: K) {
    this.handlers.delete(channel)
  },

  async invoke<K extends keyof GlobalCommands>(
    channel: K,
    ...args: Parameters<GlobalCommands[K]>
  ): Promise<Awaited<ReturnType<GlobalCommands[K]>>> {
    const handler = this.handlers.get(channel)
    if (!handler) {
      throw new ReferenceError(`No handler registered for '${channel as string}'`)
    }
    if (handler.once) {
      this.removeHandler(channel)
    }
    return handler.listener.apply(undefined, args)
  },

}

export {
  globalHandler,
}
