const EventEmitter = require('events')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { ipcMain, shell } = require('electron')
const cloneDeep = require('lodash/cloneDeep')
const isEqual = require('lodash/isEqual')
const memoize = require('lodash/memoize')
const defaultSpecs = require('../../resources/settings.spec.json')
const { userData, resources } = require('../utils/directory')
const { broadcast } = require('./frame')

/**
 * @typedef SettingSpec
 * @property {string} key
 * @property {string|string[]} type
 * @property {string} label
 * @property {any[]} [paradigm]
 * @property {string[]} [comments]
 * @property {any} [default]
 */

/**
 * @type {SettingSpec[]}
 */
let currentSpecs = defaultSpecs

const getSettingsEvents = memoize(() => {
  return new EventEmitter()
})

function addSettingsSpecs(specs) {
  currentSpecs.push(...specs)
  broadcast('settings-specs-updated', currentSpecs)
  updateSettings()
}

function removeSettingsSpecs(specs) {
  currentSpecs = currentSpecs.filter(item => specs.some(spec => spec.key !== item.key))
  broadcast('settings-specs-updated', currentSpecs)
  updateSettings()
}

function generateSettingsSource() {
  const sources = []
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

function loadSettings() {
  return userData.fetch('settings.json')
}

const getRawSettings = memoize(() => {
  userData.watch('settings.json', () => {
    getRawSettings.cache.set(undefined, loadSettings())
    updateUserSettings()
    updateSettings()
  })
  return loadSettings()
})

function getDefaultSettings() {
  return Object.fromEntries(currentSpecs.map(spec => [spec.key, spec.default]))
}

async function getUserSettings() {
  const result = await getRawSettings()
  return result && result.data
}

async function getSettings() {
  const defaultSettings = getDefaultSettings()
  const userSettings = await getUserSettings()
  return cloneDeep({
    ...defaultSettings,
    ...userSettings,
  })
}

async function updateUserSettings() {
  const data = await getUserSettings()
  broadcast('user-settings-updated', data)
}

async function updateSettings() {
  const data = await getSettings()
  broadcast('settings-updated', data)
  const events = getSettingsEvents()
  events.emit('updated', data)
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

/**
 * @param {string} file
 */
async function openUserFile(file) {
  const filePath = userData.file(file)
  try {
    await fs.promises.access(filePath)
  } catch {
    const examplePath = resources.file(path.join('example', file))
    await fs.promises.copyFile(examplePath, filePath)
  }
  return shell.openPath(filePath)
}

function handleSettingsMessages() {
  ipcMain.handle('get-settings-specs', () => {
    return currentSpecs
  })
  ipcMain.handle('get-user-settings', () => {
    return getUserSettings()
  })
  ipcMain.handle('get-settings', () => {
    return getSettings()
  })
  ipcMain.handle('set-settings', async (event, data) => {
    // Filter default values on saving
    const defaultSettings = Object.fromEntries(
      currentSpecs.map(spec => [spec.key, spec.default])
    )
    // TODO: better data merging logic
    const simplified = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => !isEqual(value, defaultSettings[key])
      )
    )
    const result = await getRawSettings()
    return userData.update('settings.json', {
      data: simplified,
      writer: result && result.writer,
    })
  })
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
  ipcMain.handle('open-user-file', (event, file) => {
    return openUserFile(file)
  })
  ipcMain.handle('download-user-file', (event, file, url, force) => {
    return userData.download(file, url, force)
  })
}

module.exports = {
  getSettings,
  getDefaultSettings,
  getSettingsEvents,
  addSettingsSpecs,
  removeSettingsSpecs,
  openSettingsFile,
  handleSettingsMessages,
}
