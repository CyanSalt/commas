import * as addon from './modules/addon'
import * as raw from './renderer'

const proxy = addon.cloneAPI(raw, {
  __name__: 'terminal',
  __entry__: '',
})

export {
  addon,
  proxy,
  raw,
}
