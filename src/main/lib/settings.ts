import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { ipcMain, shell } from 'electron'
import { cloneDeep, isEqual } from 'lodash'
import YAML from 'yaml'
import { surface } from '../../shared/compositions'
import { globalHandler } from '../../shared/handler'
import type { Settings, SettingsSpec } from '@commas/types/settings'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { resourceFile, userFile } from '../utils/directory'
import { ensureFile, writeFile } from '../utils/file'
import { translate } from './i18n'

const defaultSpecs: SettingsSpec[] = require(resourceFile('settings.spec.json'))

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

let oldSettings: Settings | undefined
const settings = $computed<Settings>({
  get() {
    const definition = cloneDeep({
      ...defaultSettings,
      ...userSettings,
    })
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
    userSettings = Object.fromEntries(
      Object.entries(data).filter(
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

async function openSettingsFile() {
  const file = await prepareSettingsFile()
  return shell.openPath(file)
}

async function openUserDirectory() {
  await ensureFile(userFile('settings.yaml'))
  return shell.openPath(userFile())
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
  globalHandler.handle('global:open-settings', () => {
    return openSettingsFile()
  })
  ipcMain.handle('open-user-directory', () => {
    return openUserDirectory()
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
  openUserDirectory,
  handleSettingsMessages,
}
