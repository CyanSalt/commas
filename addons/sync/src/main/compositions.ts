import * as commas from 'commas:api/main'
import { safeStorage } from 'electron'
import { memoize } from 'lodash'
import type { SyncData } from '../../typings/sync'

let syncData = $(commas.file.useJSONFile<SyncData>(commas.file.userFile('sync-data.json'), {
  encryption: null,
  updatedAt: null,
}))

const reactiveSyncData = commas.helper.surface($$(syncData))

function getSyncDataRef() {
  return $$(syncData)
}

function useSyncData() {
  return reactiveSyncData
}

const encryptToken = memoize((plain: string) => {
  try {
    return safeStorage.encryptString(plain).toString('base64')
  } catch {
    return null
  }
})

const decryptToken = memoize((encryption: string | null) => {
  if (!encryption) return null
  try {
    return safeStorage.decryptString(Buffer.from(encryption, 'base64'))
  } catch {
    return null
  }
})

export {
  getSyncDataRef,
  useSyncData,
  encryptToken,
  decryptToken,
}
