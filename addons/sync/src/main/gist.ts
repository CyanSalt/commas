import * as path from 'node:path'
import * as commas from 'commas:api/main'
import type { SyncPlan } from '../../typings/sync'
import { useSyncData } from './compositions'

interface FileData {
  content: string,
}

const syncData = useSyncData()

async function uploadFiles(plan: SyncPlan) {
  const token = syncData.token
  if (!token) return
  const entries: Record<string, FileData> = {}
  await Promise.all(plan.files.map(async file => {
    const key = file.replaceAll(path.sep, '__')
    const content = await commas.file.readFile(path.join(plan.directory, file))
    if (content) {
      entries[key] = { content }
    }
  }))
  const result = await commas.shell.requestJSON(plan.gist ? {
    url: `https://api.github.com/gists/${plan.gist}`,
    method: 'PATCH',
  } : {
    url: `https://api.github.com/gists`,
    method: 'POST',
  }, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${token}`,
    },
    body: JSON.stringify({
      description: plan.name,
      public: plan.gist ? undefined : false,
      files: entries,
    }),
  })
  return result
}

async function downloadFiles(plan: SyncPlan) {
  const token = syncData.token
  if (!token || !plan.gist) return
  const result = await commas.shell.requestJSON({
    url: `https://api.github.com/gists/${plan.gist}`,
    method: 'GET',
  }, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${token}`,
    },
  })
  const entries: Record<string, FileData> = result.files
  await Promise.all(Object.entries(entries).map(([key, data]) => {
    const file = key.replaceAll('__', path.sep)
    if (!plan.files.includes(file)) return undefined
    return commas.file.writeFile(path.join(plan.directory, file), data.content)
  }))
  return result
}

export {
  uploadFiles,
  downloadFiles,
}
