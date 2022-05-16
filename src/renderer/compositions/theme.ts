import { ipcRenderer } from 'electron'
import { watchEffect } from 'vue'
import type { Theme } from '../../../typings/theme'
import { injectIPC } from '../utils/compositions'

const theme = $(injectIPC('theme', { variables: {} } as Theme))

export function useTheme() {
  return $$(theme)
}

export function injectTheme() {
  watchEffect((onInvalidate) => {
    const type = theme.type
    document.body.dataset.themeType = type
    onInvalidate(() => {
      delete document.body.dataset.themeType
    })
  })
  watchEffect((onInvalidate) => {
    const declarations = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection: Promise<string> = ipcRenderer.invoke('inject-style', `:root[data-commas] { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
