import * as addon from './modules/addon'
import * as raw from './renderer'

export const proxy = addon.cloneAPI(raw, 'terminal')

export {
  addon,
  raw,
}
