import * as commas from 'commas:api/main'
import type { Launcher, LauncherInfo } from '../../types/launcher'

const generateID = commas.helper.createIDGenerator()

function fillLauncherIDs(launchers: LauncherInfo[], old: Launcher[] | null) {
  const oldValues = old ? [...old] : []
  return launchers.map<Launcher>(launcher => {
    const index = oldValues.findIndex(item => {
      return item.name === launcher.name || (
        item.remote === launcher.remote && item.directory === launcher.directory
      )
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

let rawLaunchers = $(commas.file.useYAMLFile<LauncherInfo[]>(
  commas.file.userFile('launchers.yaml'),
  [],
))

let oldValue: Launcher[]
const launchers = $computed({
  get: () => {
    const value = fillLauncherIDs(rawLaunchers, oldValue)
    oldValue = value
    return value
  },
  set: value => {
    rawLaunchers = value.map(({ id, ...launcher }) => launcher)
  },
})

function useLaunchers() {
  return $$(launchers)
}

export {
  useLaunchers,
}
