import type { Ref } from '@vue/reactivity'
import { effect, stop, toRaw, unref } from '@vue/reactivity'
import { ipcMain } from 'electron'
import { broadcast } from '../lib/frame'

export function provideIPC<T>(key: string, valueRef: Ref<T>) {
  ipcMain.handle(`get-ref:${key}`, () => toRaw(unref(valueRef)))
  ipcMain.handle(`set-ref:${key}`, (event, value: T) => {
    valueRef.value = value
  })
  const reactiveEffect = effect(async () => {
    broadcast(`update-ref:${key}`, await unref(valueRef))
  })
  return () => {
    ipcMain.removeHandler(`get-ref:${key}`)
    ipcMain.removeHandler(`set-ref:${key}`)
    stop(reactiveEffect)
  }
}
