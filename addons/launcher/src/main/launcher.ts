import { computed, unref } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import type { Launcher, LauncherInfo } from '../../typings/launcher'

const generateID = commas.helper.createIDGenerator()

function fillLauncherIDs(launchers: LauncherInfo[], old: Launcher[] | null) {
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
      id: matched ? matched.id : `launcher@${generateID()}`,
    }
  })
}

const rawLaunchersRef = commas.file.useYAMLFile<LauncherInfo[]>(
  commas.file.userFile('launchers.yaml'),
  [],
)

let oldValue: Launcher[]
const launchersRef = computed({
  get: () => {
    const value = unref(rawLaunchersRef)
    const launchers = fillLauncherIDs(value, oldValue)
    oldValue = launchers
    return launchers
  },
  set: value => {
    rawLaunchersRef.value = value.map(({ id, ...launcher }) => launcher)
  },
})

function useLaunchers() {
  return launchersRef
}

export {
  useLaunchers,
}
