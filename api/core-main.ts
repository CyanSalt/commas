import * as raw from './main'
import * as addon from './modules/addon'

export const proxy = addon.cloneAPI(raw, 'commas')

export {
  addon,
  raw,
}
