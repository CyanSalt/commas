import { computed, unref } from '@vue/reactivity'
import type { Launcher } from '../../typings/launcher'
import { userData } from '../utils/directory'
import { createIDGenerator } from '../utils/helper'
import { provideIPC } from '../utils/hooks'

const generateID = createIDGenerator()

function fillLauncherIDs(launchers: Omit<Launcher, 'id'>[], old: Launcher[] | null) {
  const oldValues = old ? [...old] : []
  return launchers.map<Launcher>(launcher => {
    const index = oldValues.findIndex(item => {
      return item.remote === launcher.remote && (item.name === launcher.name || (
        item.directory === launcher.directory && item.command === launcher.command
      ))
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

const rawLaunchersRef = userData.useYAML<Omit<Launcher, 'id'>[]>('launchers.yaml', [])

let oldValue: Launcher[]
const launchersRef = computed(() => {
  const value = unref(rawLaunchersRef)
  const launchers = fillLauncherIDs(value, oldValue)
  oldValue = launchers
  return launchers
})

function handleLauncherMessages() {
  provideIPC('launchers', launchersRef)
}

export {
  handleLauncherMessages,
}
