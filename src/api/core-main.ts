import * as raw from './main'
import * as addon from './modules/addon'

const proxy = addon.cloneAPI(raw, {
  __name__: 'terminal',
  __entry__: '',
  __manifest__: {},
})

export {
  addon,
  proxy,
  raw,
}
