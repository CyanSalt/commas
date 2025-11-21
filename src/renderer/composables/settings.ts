import { watchEffect } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import type { Settings } from '@commas/types/settings'
import { surface } from '../../shared/composables'
import { reuse } from '../../shared/helper'
import { injectIPC } from '../utils/composables'

const settings = surface(
  injectIPC('settings', {} as Settings),
  true,
)

export function useSettings() {
  return settings
}

export const useSettingsSpecs = reuse(() => {
  return injectIPC('settings-specs', [])
})

export const useAddons = reuse(() => {
  return injectIPC('addons', [])
})

export function injectSettingsStyle() {
  watchEffect((onInvalidate) => {
    const fontFamily = settings['terminal.style.fontFamily']
    const fontSize = settings['terminal.style.fontSize']
    const fontLigatures = settings['terminal.style.fontLigatures']
    const lineHeight = settings['terminal.style.lineHeight']
    const styles = {
      'font-family': fontFamily ? (
        process.platform === 'win32' ? fontFamily : `${fontFamily}, monospace`
      ) : 'monospace',
      'font-size': fontSize ? `${fontSize}px` : 'inherit',
      'line-height': lineHeight ? `${lineHeight}${lineHeight > 8 ? 'px' : ''}` : 'inherit',
      'font-variant-ligatures': fontLigatures ? 'normal' : 'none',
    }
    const declarations = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection = ipcRenderer.invoke('inject-style', `:root[data-commas] body { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
