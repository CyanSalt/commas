import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { shell } from 'electron'
import { cloneDeep, difference, isEqual } from 'lodash'
import YAML from 'yaml'
import { ipcMain } from '@commas/electron-ipc'
import type { Settings, SettingsSpec } from '@commas/types/settings'
import { surface } from '../../shared/compositions'
import { globalHandler } from '../../shared/handler'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { resourceFile, userFile } from '../utils/directory'
import { ensureFile, writeFile } from '../utils/file'
import { translate } from './i18n'

const defaultSpecs: SettingsSpec[] = require(resourceFile('settings.spec.json'))

declare module '@commas/electron-ipc' {
  export interface Commands {
    'open-settings': () => void,
    'prepare-user-directory': typeof prepareUserDirectory,
    'prepare-settings-file': typeof prepareSettingsFile,
    'prepare-default-settings': typeof prepareDefaultSettings,
    'prepare-user-file': typeof prepareUserFile,
    'write-user-file': typeof writeUserFile,
  }
  export interface Refs {
    'settings-specs': typeof specs,
    settings: typeof settings,
  }
  export interface GlobalCommands {
    'global-main:open-settings': () => void,
  }
}

const specs = $ref(defaultSpecs)

function useSettingsSpecs() {
  return $$(specs)
}

function generateSettingsSource() {
  const sources: string[] = []
  for (const spec of specs) {
    if (spec.comments) {
      for (let i = 0; i < spec.comments.length; i += 1) {
        sources.push(`# ${translate(`${spec.comments[i]}#!settings.comments.${i}.${spec.key}`)}`)
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

const defaultSettings = $computed(() => {
  return Object.fromEntries(specs.map(spec => [spec.key, spec.default])) as Settings
})

const reactiveDefaultSettings = surface($$(defaultSettings))

function useDefaultSettings() {
  return reactiveDefaultSettings
}

const loadingState = Promise.withResolvers<void>()

function whenSettingsReady() {
  return loadingState.promise
}

let userSettings = $(useYAMLFile(userFile('settings.yaml'), {} as Settings, {
  onTrigger() {
    loadingState.resolve()
  },
}))

let isReady = false
loadingState.promise.then(() => {
  isReady = true
})

function resolveOverridden(values: string[]) {
  const result = new Set<string>()
  for (const value of values) {
    if (value.startsWith('!')) {
      result.delete(value.slice(1))
    } else {
      result.add(value)
    }
  }
  return Array.from(result)
}

function createOverridden(previous: string[], current: string[]) {
  const values = resolveOverridden(previous)
  const overridden = [
    ...difference(values, current).map(value => `!${value}`),
    ...difference(current, values).map(value => value),
  ]
  return overridden.length ? overridden : undefined
}

let oldSettings: Settings | undefined
const settings = $computed({
  get() {
    const definition = cloneDeep({
      ...defaultSettings,
      ...userSettings,
    })
    for (const spec of specs) {
      if (spec.overrides) {
        definition[spec.key] = resolveOverridden([
          ...(spec.recommendations ?? []),
          ...spec.default,
          ...definition[spec.key],
        ])
      }
    }
    let actualSettings = {} as Settings
    if (oldSettings) {
      for (const spec of specs) {
        if (definition[spec.key] !== oldSettings[spec.key] && spec.reload) {
          actualSettings[spec.key] = oldSettings[spec.key]
        } else {
          actualSettings[spec.key] = definition[spec.key]
        }
      }
    } else {
      actualSettings = definition
    }
    if (isReady) {
      oldSettings = actualSettings
    }
    return actualSettings
  },
  set(data) {
    const definition: Settings = { ...data }
    for (const spec of specs) {
      if (spec.overrides) {
        definition[spec.key] = createOverridden([
          ...(spec.recommendations ?? []),
          ...spec.default,
        ], definition[spec.key])
      }
    }
    userSettings = Object.fromEntries(
      Object.entries(definition).filter(
        ([key, value]) => (value !== undefined && !isEqual(value, defaultSettings[key])),
      ),
    ) as Settings
  },
})

const reactiveSettings = surface($$(settings))

function useSettings() {
  return reactiveSettings
}

async function prepareSettingsFile() {
  const file = userFile('settings.yaml')
  try {
    await fs.promises.access(file)
  } catch {
    await writeFile(file, generateSettingsSource())
  }
  return file
}

async function prepareDefaultSettings() {
  const file = path.join(os.tmpdir(), 'commas-default-settings.yaml')
  await writeFile(file, generateSettingsSource())
  return file
}

async function prepareUserFile(file: string, example?: string) {
  const filePath = userFile(file)
  try {
    await fs.promises.access(filePath)
  } catch {
    if (!example) {
      example = resourceFile('examples', file)
    }
    await fs.promises.copyFile(example, filePath)
  }
  return filePath
}

async function prepareUserDirectory() {
  await ensureFile(userFile('settings.yaml'))
  return userFile()
}

async function openSettingsFile() {
  const file = await prepareSettingsFile()
  return shell.openPath(file)
}

export function writeUserFile(file: string, content?: string) {
  const filePath = userFile(file)
  return writeFile(filePath, content)
}

function handleSettingsMessages() {
  provideIPC('settings-specs', $$(specs))
  provideIPC('settings', $$(settings))
  ipcMain.handle('open-settings', () => {
    return openSettingsFile()
  })
  globalHandler.handle('global-main:open-settings', () => {
    return openSettingsFile()
  })
  ipcMain.handle('prepare-user-directory', () => {
    return prepareUserDirectory()
  })
  ipcMain.handle('prepare-settings-file', () => {
    return prepareSettingsFile()
  })
  ipcMain.handle('prepare-default-settings', () => {
    return prepareDefaultSettings()
  })
  ipcMain.handle('prepare-user-file', (event, file: string, example?: string) => {
    return prepareUserFile(file, example)
  })
  ipcMain.handle('write-user-file', (event, file: string, content?: string) => {
    return writeUserFile(file, content)
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
