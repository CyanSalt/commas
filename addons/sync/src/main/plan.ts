import * as fs from 'node:fs'
import * as path from 'node:path'
import * as commas from 'commas:api/main'
import type { SyncPlan } from '../types/sync'

const settings = commas.settings.useSettings()
const defaultFiles = commas.context.getCollection('sync.file')

const defaultPlan = $computed<SyncPlan>(() => {
  const ignores = settings['sync.plan.ignores']
  return {
    name: 'Commas Sync',
    gist: settings['sync.plan.gist'],
    directory: commas.file.userFile(),
    files: defaultFiles
      .filter(file => !ignores.includes(file)),
  }
})

function useDefaultSyncPlan() {
  return $$(defaultPlan)
}

async function createSyncPlan(paths: string[]): Promise<SyncPlan> {
  let directory = ''
  let files: string[] = []
  if (paths.length === 1) {
    const file = paths[0]
    const stats = await fs.promises.stat(paths[0])
    if (stats.isDirectory()) {
      directory = file
    } else {
      directory = path.dirname(file)
      files.push(file)
    }
  } else if (paths.length > 0) {
    directory = path.dirname(paths[0])
    while (!paths.every(file => file.startsWith(directory + path.sep))) {
      const parent = path.dirname(directory)
      if (directory === parent) {
        directory = ''
      }
      directory = parent
    }
    files = paths
  }
  return {
    name: path.basename(directory),
    gist: '',
    directory,
    files: directory
      ? paths.map(file => path.relative(directory, file))
      : paths,
  }
}

export {
  useDefaultSyncPlan,
  createSyncPlan,
}
