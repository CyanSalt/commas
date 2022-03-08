import type * as Main from './main'
import type * as Renderer from './renderer'

type MixValues<T, U> = {
  [K in keyof T]: T[K] & U
}

export type MainAPI = typeof Main
export type RendererAPI = typeof Renderer
export type API = MainAPI & RendererAPI

export interface APIContext<T = API> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __name__: string,
  $: MixValues<T, APIContext>,
  _: unknown,
}

export type MainAPIContext = APIContext<MainAPI>
export type RendererAPIContext = APIContext<RendererAPI>
