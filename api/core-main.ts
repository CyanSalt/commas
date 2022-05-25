import * as raw from './main'
import * as addon from './modules/addon'

const proxy = addon.cloneAPI(raw, 'terminal', '')

export {
  addon,
  proxy,
  raw,
}
