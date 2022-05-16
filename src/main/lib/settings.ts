import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { computed, customRef, effect, ref, unref } from '@vue/reactivity'
import { ipcMain, shell } from 'electron'
import { cloneDeep, isEqual } from 'lodash'
import YAML from 'yaml'
import type { Settings, SettingsSpec } from '../../../typings/settings'
import { surface } from '../../shared/compositions'
import { provideIPC } from '../utils/compositions'
import { userData, resources } from '../utils/directory'
import { globalHandler } from '../utils/handler'

const defaultSpecs = resources.require<SettingsSpec[]>('settings.spec.json')!

const specsRef = ref(defaultSpecs)

function useSettingsSpecs() {
  return specsRef
}

function generateSettingsSource() {
  const currentSpecs = unref(specsRef)
  const sources: string[] = []
  for (const spec of currentSpecs) {
    if (spec.comments) {
      for (const comment of spec.comments) {
        sources.push(`# ${comment}`)
      }
    }
    const defaultValue = spec.default
    const value = YAML.stringify(defaultValue).trim()
    if (defaultValue && typeof defaultValue === 'object' && Object.keys(defaultValue).length) {
      sources.push(`${spec.key}:`, ...value.split('\n').map(line => '  ' + line))
    } else {
      sources.push(`${spec.key}: ${value}`)
    }
    sources.push('')
  }
  return ['---', ...sources]
    .join('\n')
}

const defaultSettingsRef = computed<Settings>(() => {
  const currentSpecs = unref(specsRef)
  return Object.fromEntries(currentSpecs.map(spec => [spec.key, spec.default]))
})

const reactiveDefaultSettings = surface(defaultSettingsRef)

function useDefaultSettings() {
  return reactiveDefaultSettings
}

let isReady = false
let resolveWhenReady: (() => void) | undefined
const whenReadyPromise = new Promise<void>(resolve => {
  resolveWhenReady = () => {
    isReady = true
    resolve()
  }
})

function whenSettingsReady() {
  return whenReadyPromise
}

const userSettingsRef = userData.useYAML<Settings>('settings.yaml', {}, resolveWhenReady)

let oldSettings: Settings | undefined
const settingsRef = computed<Settings>({
  get() {
    const defaultSettings = unref(defaultSettingsRef)
    const userSettings = unref(userSettingsRef)
    const settings = cloneDeep({
      ...defaultSettings,
      ...userSettings,
    })
    let actualSettings = {}
    if (oldSettings) {
      const specs = unref(specsRef)
      for (const spec of specs) {
        if (settings[spec.key] !== oldSettings[spec.key] && spec.reload) {
          actualSettings[spec.key] = oldSettings[spec.key]
        } else {
          actualSettings[spec.key] = settings[spec.key]
        }
      }
    } else {
      actualSettings = settings
    }
    if (isReady) {
      oldSettings = actualSettings
    }
    return actualSettings
  },
  set(data) {
    const defaultSettings = unref(defaultSettingsRef)
    userSettingsRef.value = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => !isEqual(value, defaultSettings[key]),
      ),
    )
  },
})

const reactiveSettings = surface(settingsRef)

function useSettings() {
  return reactiveSettings
}

const enabledAddonsRef = customRef<string[]>((track, trigger) => {
  let addons: string[] = []
  whenSettingsReady().then(() => {
    effect(() => {
      addons = reactiveSettings['terminal.addon.includes']
      trigger()
    })
  })
  return {
    get() {
      track()
      return addons
    },
    set(value) {
      reactiveSettings['terminal.addon.includes'] = value
    },
  }
})

function useEnabledAddons() {
  return enabledAddonsRef
}

async function openSettingsFile() {
  const name = 'settings.yaml'
  const file = userData.file(name)
  try {
    await fs.promises.access(file)
  } catch {
    await userData.write(name, generateSettingsSource())
  }
  return shell.openPath(file)
}

async function openDefaultSettings() {
  const source = generateSettingsSource()
  const target = path.join(os.tmpdir(), 'commas-default-settings.yaml')
  try {
    await fs.promises.writeFile(target, source)
    return shell.openPath(target)
  } catch {
    // ignore error
  }
}

async function openUserFile(file: string, example?: string) {
  const filePath = userData.file(file)
  try {
    await fs.promises.access(filePath)
  } catch {
    if (!example) {
      example = resources.file(path.join('examples', file))
    }
    await fs.promises.copyFile(example, filePath)
  }
  return shell.openPath(filePath)
}

function handleSettingsMessages() {
  provideIPC('settings-specs', specsRef)
  provideIPC('user-settings', userSettingsRef)
  provideIPC('settings', settingsRef)
  ipcMain.handle('open-settings-file', () => {
    return openSettingsFile()
  })
  ipcMain.handle('open-settings', () => {
    return openSettingsFile()
  })
  globalHandler.handle('global:open-settings', () => {
    return openSettingsFile()
  })
  ipcMain.handle('open-default-settings', () => {
    return openDefaultSettings()
  })
  ipcMain.handle('open-user-directory', () => {
    return shell.openPath(userData.file('.'))
  })
  ipcMain.handle('open-user-file', (event, file: string, example?: string) => {
    return openUserFile(file, example)
  })
  ipcMain.handle('download-user-file', (event, file: string, url: string, force?: boolean) => {
    return userData.download(file, url, force)
  })
}

export {
  whenSettingsReady,
  useSettings,
  useDefaultSettings,
  useSettingsSpecs,
  useEnabledAddons,
  openSettingsFile,
  handleSettingsMessages,
}
