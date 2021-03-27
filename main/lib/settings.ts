import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { computed, effect, markRaw, ref, unref } from '@vue/reactivity'
import { ipcMain, shell } from 'electron'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import memoize from 'lodash/memoize'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { userData, resources } from '../utils/directory'
import { provideIPC } from '../utils/hooks'

const defaultSpecs: SettingsSpec[] = require('../../resources/settings.spec.json')

const specsRef = ref(defaultSpecs)

const getSettingsEvents = memoize(() => {
  return new EventEmitter()
})

function addSettingsSpecs(specs: SettingsSpec[]) {
  const currentSpecs = unref(specsRef)
  currentSpecs.push(...specs.map(markRaw))
}

function removeSettingsSpecs(specs: SettingsSpec[]) {
  const currentSpecs = unref(specsRef)
  specsRef.value = currentSpecs.filter(item => specs.some(spec => spec.key !== item.key))
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

function getDefaultSettings() {
  return unref(defaultSettingsRef)
}

const userSettingsRef = userData.use<Settings>('settings.json', {
  set(data) {
    const defaultSettings = unref(defaultSettingsRef)
    // TODO: better data merging logic
    return data ? Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => !isEqual(value, defaultSettings[key])
      )
    ) as Settings : data
  },
})

const settingsRef = computed<Promise<Settings>>({
  async get() {
    const defaultSettings = unref(defaultSettingsRef)
    const userSettings = await unref(userSettingsRef)
    return cloneDeep({
      ...defaultSettings,
      ...userSettings,
    })
  },
  set(value) {
    userSettingsRef.value = value
  },
})

function getSettings() {
  return unref(settingsRef)
}

// TODO: remove
effect(async () => {
  const data = await getSettings()
  const events = getSettingsEvents()
  events.emit('updated', data)
})

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
  getSettings,
  getDefaultSettings,
  getSettingsEvents,
  addSettingsSpecs,
  removeSettingsSpecs,
  openSettingsFile,
  handleSettingsMessages,
}
