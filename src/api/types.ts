import type * as main from './main'
import type * as renderer from './renderer'

type MixValues<T, U> = {
  [K in keyof T]: T[K] & U
}

export type MainAPI = typeof main
export type RendererAPI = typeof renderer
export type API = MainAPI & RendererAPI
export type CompatibleAPI = MainAPI | RendererAPI

export type APIAddon = (api: CompatibleAPI) => void

export interface APIContext<T = API> {
  __name__: string,
  __entry__: string,
  __manifest__: any,
  $: MixValues<T, APIContext>,
  _: unknown,
}

export type MainAPIContext = APIContext<MainAPI>
export type RendererAPIContext = APIContext<RendererAPI>
