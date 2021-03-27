import type { Launcher } from '../../typings/launcher'
import { userData } from '../utils/directory'
import { createIDGenerator } from '../utils/helper'
import { provideIPC } from '../utils/hooks'

const generateID = createIDGenerator()

function fillLauncherIDs(launchers: Launcher[], old: Launcher[] | null) {
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

const launchersRef = userData.use<Launcher[]>('launchers.json', {
  get(value, oldValue) {
    return value ? fillLauncherIDs(value, oldValue) : value
  },
  set(value) {
    return value ? value.map(({ id, ...launcher }) => launcher as Launcher) : value
  },
})

function handleLauncherMessages() {
  provideIPC('launchers', launchersRef)
}

export {
  handleLauncherMessages,
}
