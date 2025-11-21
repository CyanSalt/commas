import * as path from 'node:path'
import * as commas from 'commas:api/main'
import type { SyncPlan } from '../types/sync'
import { decryptToken, useSyncData } from './composables'

interface FileData {
  content: string,
}

interface GistData {
  id: string,
  files: Record<string, FileData>,
  owner: { login: string },
  updated_at: string,
}

const syncData = useSyncData()

async function uploadFiles(plan: SyncPlan) {
  const token = decryptToken(syncData.encryption)
  if (!token) return
  const entries: Record<string, FileData> = {}
  await Promise.all(plan.files.map(async file => {
    const key = file.replaceAll(path.sep, '__')
    const content = await commas.file.readFile(path.join(plan.directory, file))
    if (content) {
      entries[key] = { content }
    }
  }))
  const response = await fetch(
    plan.gist ? `https://api.github.com/gists/${plan.gist}` : `https://api.github.com/gists`,
    {
      method: plan.gist ? 'PATCH' : 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${token}`,
      },
      body: JSON.stringify({
        description: plan.name,
        public: plan.gist ? undefined : false,
        files: entries,
      }),
    },
  )
  const result: GistData = await response.json()
  return result
}

async function downloadFiles(plan: SyncPlan) {
  const token = decryptToken(syncData.encryption)
  if (!token || !plan.gist) return
  const response = await fetch(`https://api.github.com/gists/${plan.gist}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `token ${token}`,
    },
  })
  const result: GistData = await response.json()
  const entries = result.files
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
