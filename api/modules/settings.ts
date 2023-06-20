import * as path from 'node:path'
import { markRaw } from '@vue/reactivity'
import {
  openSettingsFile,
  openUserDirectory,
  useDefaultSettings,
  useSettings,
  useSettingsSpecs,
  writeUserFile,
} from '../../src/main/lib/settings'
import { THEME_CSS_COLORS, useTheme } from '../../src/main/lib/theme'
import type { SettingsSpec } from '../../src/typings/settings'
import type { MainAPIContext } from '../types'

let currentSpecs = $(useSettingsSpecs())

function addSettingsSpecs(specs: SettingsSpec[]) {
  currentSpecs.push(...specs.map(markRaw))
}

function removeSettingsSpecs(specs: SettingsSpec[]) {
  currentSpecs = currentSpecs.filter(item => specs.some(spec => spec.key !== item.key))
}

function addSpecs(this: MainAPIContext, specs: SettingsSpec[]) {
  const validSpecs = specs.filter(spec => spec.key.startsWith(`${this.__name__}.`))
  addSettingsSpecs(validSpecs)
  this.$.app.onInvalidate(() => {
    removeSettingsSpecs(validSpecs)
  })
}

function addSettingsSpecsFile(this: MainAPIContext, file: string) {
  const specs = require(path.resolve(this.__entry__, file))
  return addSpecs.call(this, specs)
}

export * from '../shim'

export {
  THEME_CSS_COLORS,
  addSpecs as addSettingsSpecs,
  addSettingsSpecsFile,
  useSettings,
  useDefaultSettings,
  openSettingsFile,
  openUserDirectory,
  writeUserFile,
  useTheme,
}
