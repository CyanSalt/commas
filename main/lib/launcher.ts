import { ipcMain } from 'electron'
import memoize from 'lodash/memoize'
import type { Launcher } from '../../typings/launcher'
import { userData } from '../utils/directory'
import { createIDGenerator } from '../utils/helper'
import { broadcast } from './frame'

const generateID = createIDGenerator()

function fillLauncherIDs(launchers: Launcher[], old: Launcher[] | undefined) {
  const oldValues = old ? [...old] : []
  return launchers.map<Launcher>(launcher => {
    const index = oldValues.findIndex(item => {
      return item.name === launcher.name || item.remote === launcher.remote
        && item.directory === launcher.directory
        && item.command === launcher.command
    })
    let matched: Launcher | undefined
    if (index !== -1) {
      matched = oldValues[index]
      oldValues.splice(index, 1)
    }
    return {
      ...launcher,
      id: matched ? matched.id : generateID(),
    }
  })
}

const getRawLaunchers = memoize(() => {
  userData.watch('launchers.json', async () => {
    getRawLaunchers.cache.set(undefined, loadLaunchers())
    updateLaunchers()
  })
  return loadLaunchers()
})

async function loadLaunchers() {
  const cache = await (getRawLaunchers.cache.get(undefined) as ReturnType<typeof getRawLaunchers> | undefined)
  const result = await userData.fetch<Launcher[]>('launchers.json')
  if (result?.data) {
    result.data = fillLauncherIDs(result.data, cache?.data)
  }
  return result
}

async function getLaunchers() {
  const result = await getRawLaunchers()
  return result?.data ?? []
}

async function updateLaunchers() {
  const launchers = await getLaunchers()
  broadcast('launchers-updated', launchers)
}

function handleLauncherMessages() {
  ipcMain.handle('get-launchers', () => {
    return getLaunchers()
  })
  ipcMain.handle('set-launchers', async (event, launchers: Launcher[]) => {
    const result = await getRawLaunchers()
    return userData.update('launchers.json', {
      data: launchers.map(({ id, ...launcher }) => launcher),
      writer: result?.writer,
    })
  })
}

export {
  handleLauncherMessages,
}
