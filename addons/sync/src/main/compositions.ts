import { computed, unref } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { safeStorage } from 'electron'
import type { SyncData } from '../../typings/sync'

interface RawSyncData extends Omit<SyncData, 'token'> {
  _token: string | null,
}

const rawSyncDataRef = commas.file.useJSONFile<RawSyncData>(commas.file.userFile('sync-data.json'), {
  _token: null,
  updatedAt: null,
})

const syncDataRef = computed<SyncData>({
  get() {
    const { _token: encryption, ...data } = unref(rawSyncDataRef) as SyncData & RawSyncData
    data.token = null
    if (encryption) {
      try {
        data.token = safeStorage.decryptString(Buffer.from(encryption, 'base64'))
      } catch {
        // ignore
      }
    }
    return data
  },
  set(value) {
    const { token, ...data } = value as SyncData & RawSyncData
    data._token = null
    if (token) {
      data._token = safeStorage.encryptString(token).toString('base64')
    }
    rawSyncDataRef.value = data
  },
})

const syncData = commas.helper.surface(syncDataRef)

function getSyncDataRef() {
  return syncDataRef
}

function useSyncData() {
  return syncData
}

export {
  getSyncDataRef,
  useSyncData,
}
