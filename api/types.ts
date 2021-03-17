import type * as Main from './main'
import type * as Renderer from './renderer'

type MixValues<T, U> = {
  [K in keyof T]: T[K] & U
}

export interface CommasContext<T = unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __name__: string,
  $: MixValues<typeof Main & typeof Renderer, CommasContext>,
  _: T,
}
