import type { Ref } from '@vue/reactivity'
import { effect, stop, unref } from '@vue/reactivity'
import { ipcMain } from 'electron'
import { broadcast } from '../lib/frame'

export function provideIPC<T>(key: string, valueRef: Ref<T>) {
  ipcMain.handle(`get-ref:${key}`, () => {
    return unref(valueRef)
  })
  ipcMain.handle(`set-ref:${key}`, (event, value: T) => {
    valueRef.value = value
  })
  const reactiveEffect = effect(() => {
    broadcast(`update-ref:${key}`, unref(valueRef))
  }, { lazy: true })
  return () => {
    ipcMain.removeHandler(`get-ref:${key}`)
    ipcMain.removeHandler(`set-ref:${key}`)
    stop(reactiveEffect)
  }
}
