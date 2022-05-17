import * as path from 'path'
import { computed, effect, unref } from '@vue/reactivity'
import type { BrowserWindow } from 'electron'
import { app } from 'electron'
import { differenceBy } from 'lodash'
import semver from 'semver'
import * as commas from '../../../api/core-main'
import type { AddonInfo } from '../../../typings/addon'
import { provideIPC } from '../utils/compositions'
import { userData } from '../utils/directory'
import { notify } from '../utils/notification'
import { translate } from './i18n'
import { useSettings } from './settings'

function getAddonPaths() {
  return [
    { type: 'builtin' as const, base: path.join(__dirname, '../../addons') },
    { type: 'user' as const, base: userData.file('addons') },
  ]
}

function resolveAddon(name: string) {
  const paths = getAddonPaths()
  for (const { type, base } of paths) {
    try {
      const entry = path.join(base, name)
      const manifest = require(path.join(entry, 'package.json'))
      return { type, name, entry, manifest } as AddonInfo
    } catch {
      // continue
    }
    if (type === 'user') {
      try {
        const entry = path.join(base, `${name}.asar`)
        const manifest = require(path.join(entry, 'package.json'))
        return { type, name, entry, manifest } as AddonInfo
      } catch {
        // ignore
      }
    }
  }
}

function checkAddon(addon: AddonInfo) {
  const { manifest } = addon
  const engines = manifest.engines ? Object.entries<string>(manifest.engines) : []
  for (const [engine, range] of engines) {
    const version = engine === 'commas' ? app.getVersion() : process.versions[engine]
    if (version && !semver.satisfies(version, range, { loose: true, includePrerelease: true })) {
      notify({
        type: 'error',
        body: translate('Addon [%N] only supports %A %E, not %V#!terminal.6', {
          N: addon.name,
          A: engine,
          E: range,
          V: version,
        }),
      })
    }
  }
}

const addonsRef = computed(() => {
  const settings = useSettings()
  const enabledAddons = settings['terminal.addon.includes']
  return enabledAddons
    .map(name => resolveAddon(name))
    .filter((item): item is AddonInfo => Boolean(item))
})

function loadAddons() {
  let loadedAddons: AddonInfo[] = []
  effect(() => {
    const addons = unref(addonsRef)
    differenceBy(loadedAddons, addons, (addon: AddonInfo) => addon.name).forEach(addon => {
      commas.addon.unloadAddon(addon)
    })
    differenceBy(addons, loadedAddons, (addon: AddonInfo) => addon.name).forEach(addon => {
      checkAddon(addon)
      commas.addon.loadAddon(addon, commas.raw)
    })
    loadedAddons = [...addons]
  })
}

function loadCustomJS() {
  commas.addon.loadAddon({
    type: 'user',
    name: 'custom.js',
    entry: '',
    manifest: {},
  }, commas.raw)
}

function loadCustomCSS(frame: BrowserWindow) {
  const loadingCSS = userData.read('custom.css')
  frame.webContents.once('did-finish-load', async () => {
    const styles = await loadingCSS
    if (styles) {
      frame.webContents.insertCSS(styles)
    }
  })
}

function handleAddonMessages() {
  provideIPC('addons', addonsRef)
}

export {
  loadAddons,
  loadCustomJS,
  loadCustomCSS,
  getAddonPaths,
  resolveAddon,
  handleAddonMessages,
}
