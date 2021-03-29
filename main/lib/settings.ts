import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { computed, ref, unref } from '@vue/reactivity'
import { ipcMain, shell } from 'electron'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { userData, resources } from '../utils/directory'
import { globalHandler } from '../utils/handler'
import { provideIPC } from '../utils/hooks'

const defaultSpecs: SettingsSpec[] = require('../../resources/settings.spec.json')

const specsRef = ref(defaultSpecs)

function useSettingsSpecs() {
  return specsRef
}

function generateSettingsSource() {
  const currentSpecs = unref(specsRef)
  const sources: string[] = []
  for (const spec of currentSpecs) {
    if (sources.length) {
      sources[sources.length - 1] += ',\n'
    }
    if (spec.comments) {
      for (const comment of spec.comments) {
        sources.push(`// ${comment}`)
      }
    }
    const key = JSON.stringify(spec.key)
    const value = JSON.stringify(spec.default, null, 2)
    const entry = `${key}: ${value}`
    const lines = entry.split('\n')
    for (const line of lines) {
      sources.push(line)
    }
  }
  return ['{', ...sources.map(line => (line ? `  ${line}` : '')), '}', '']
    .join('\n')
}

const defaultSettingsRef = computed<Settings>(() => {
  const currentSpecs = unref(specsRef)
  return Object.fromEntries(currentSpecs.map(spec => [spec.key, spec.default]))
})

function useDefaultSettings() {
  return defaultSettingsRef
}

let resolveWhenReady: (() => void) | undefined
const whenReadyPromise = new Promise<void>(resolve => {
  resolveWhenReady = resolve
})

function whenSettingsReady() {
  return whenReadyPromise
}

const userSettingsRef = userData.use<Settings>('settings.json', {}, resolveWhenReady)

const settingsRef = computed<Settings>({
  get() {
    const defaultSettings = unref(defaultSettingsRef)
    const userSettings = unref(userSettingsRef)
    return cloneDeep({
      ...defaultSettings,
      ...userSettings,
    })
  },
  set(data) {
    const defaultSettings = unref(defaultSettingsRef)
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => !isEqual(value, defaultSettings[key])
      )
    )
  },
})

function useSettings() {
  return settingsRef
}

async function openSettingsFile() {
  const name = 'settings.json'
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
  const target = path.join(os.tmpdir(), 'commas-default-settings.json')
  try {
    await fs.promises.writeFile(target, source)
    return shell.openPath(target)
  } catch {
    // ignore error
  }
}

async function openUserFile(file: string) {
  const filePath = userData.file(file)
  try {
    await fs.promises.access(filePath)
  } catch {
    const examplePath = resources.file(path.join('examples', file))
    await fs.promises.copyFile(examplePath, filePath)
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
  ipcMain.handle('open-user-file', (event, file: string) => {
    return openUserFile(file)
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
  openSettingsFile,
  handleSettingsMessages,
}
