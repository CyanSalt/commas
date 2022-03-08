import * as addon from './modules/addon'
import * as raw from './renderer'

const proxy = addon.cloneAPI(raw, 'terminal')

export {
  addon,
  proxy,
  raw,
}
