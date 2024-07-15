import * as path from 'node:path'
import { effect } from '@vue/reactivity'
import type { BrowserWindow } from 'electron'
import { app } from 'electron'
import { differenceBy } from 'lodash'
import semver from 'semver'
import * as commas from '../../../api/core-main'
import type { AddonInfo } from '@commas/types/addon'
import { provideIPC } from '../utils/compositions'
import { userFile } from '../utils/directory'
import { readFile } from '../utils/file'
import { notify } from '../utils/notification'
import { translate } from './i18n'
import { useSettings } from './settings'

function getAddonPaths() {
  return [
    { type: 'builtin' as const, base: path.join(__dirname, '../../addons') },
    { type: 'user' as const, base: userFile('addons') },
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
        body: translate('Addon [${name}] only supports ${engine} ${range}, not ${version}#!terminal.6', {
          name: addon.name,
          engine,
          range,
          version,
        }),
      })
    }
  }
}

const includedAddons = $computed(() => {
  const settings = useSettings()
  const enabledAddons = settings['terminal.addon.includes']
  return enabledAddons
    .map(name => resolveAddon(name))
    .filter((item): item is AddonInfo => Boolean(item))
})

let loadedAddons = $ref<AddonInfo[]>([])

function loadAddons() {
  effect(() => {
    differenceBy(loadedAddons, includedAddons, (addon: AddonInfo) => addon.name).forEach(addon => {
      commas.addon.unloadAddon(addon)
    })
    differenceBy(includedAddons, loadedAddons, (addon: AddonInfo) => addon.name).forEach(addon => {
      checkAddon(addon)
      commas.addon.loadAddon(addon, commas.raw)
    })
    loadedAddons = [...includedAddons]
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
  const loadingCSS = readFile(userFile('custom.css'))
  frame.webContents.once('did-finish-load', async () => {
    const styles = await loadingCSS
    if (styles) {
      frame.webContents.insertCSS(styles)
    }
  })
}

function handleAddonMessages() {
  provideIPC('addons', $$(loadedAddons))
}

export {
  loadAddons,
  loadCustomJS,
  loadCustomCSS,
  getAddonPaths,
  resolveAddon,
  handleAddonMessages,
}
