const globalHandler = {

  handlers: new Map<string, {
    listener: (...args: any[]) => any,
    once?: boolean,
  }>(),

  handle(channel: string, listener: (...args: any[]) => any) {
    this.handlers.set(channel, { listener })
  },

  handleOnce(channel: string, listener: (...args: any[]) => any) {
    this.handlers.set(channel, { listener, once: true })
  },

  removeHandler(channel: string) {
    this.handlers.delete(channel)
  },

  async invoke(channel: string, ...args: any[]) {
    const handler = this.handlers.get(channel)
    if (!handler) {
      throw new ReferenceError(`No handler registered for '${channel}'`)
    }
    if (handler.once) this.removeHandler(channel)
    return handler.listener.apply(undefined, args)
  },

}

export {
  globalHandler,
}
