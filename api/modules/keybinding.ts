import * as path from 'node:path'
import { markRaw } from '@vue/reactivity'
import { useAddonKeyBindings } from '../../src/main/lib/menu'
import type { KeyBinding } from '../../src/typings/menu'
import type { MainAPIContext } from '../types'

const addonKeyBindings = $(useAddonKeyBindings())

function addKeyBinding(item: KeyBinding) {
  addonKeyBindings.push(markRaw(item))
}

function removeKeyBinding(item: KeyBinding) {
  const index = addonKeyBindings.indexOf(item)
  if (index !== -1) {
    addonKeyBindings.splice(index, 1)
  }
}

function addKeyBindings(this: MainAPIContext, bindings: KeyBinding[]) {
  bindings.forEach(binding => {
    addKeyBinding(binding)
  })
  this.$.app.onInvalidate(() => {
    bindings.forEach(binding => {
      removeKeyBinding(binding)
    })
  })
}

function addKeyBindingsFile(this: MainAPIContext, file: string) {
  const bindings = require(path.resolve(this.__entry__, file))
  return addKeyBindings.call(this, bindings)
}

export * from '../shim'

export {
  addKeyBindings,
  addKeyBindingsFile,
}
