import { ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { unref, watchEffect } from 'vue'
import type { Theme } from '../../typings/theme'
import { injectIPC } from '../utils/hooks'

export const useTheme = memoize(() => {
  return injectIPC('theme', { variables: {} } as Theme)
})

export function injectTheme() {
  const themeRef = useTheme()
  watchEffect((onInvalidate) => {
    const theme = unref(themeRef)
    const type = theme.type
    document.body.dataset.themeType = type
    onInvalidate(() => {
      delete document.body.dataset.themeType
    })
  })
  watchEffect((onInvalidate) => {
    const theme = unref(themeRef)
    const declarations = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection: Promise<string> = ipcRenderer.invoke('inject-style', `:root[data-commas] { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
