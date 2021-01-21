import { ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { computed, unref, watchEffect } from 'vue'
import type { Theme } from '../../typings/theme'
import { useRemoteData } from './remote'

export const useTheme = memoize(() => {
  return useRemoteData({} as Theme, {
    getter: 'get-theme',
    effect: 'theme-updated',
  })
})

const themeStyleRef = computed<Partial<CSSStyleDeclaration>>(() => {
  const property = {
    systemAccent: '--system-accent',
  }
  const theme = unref(useTheme())
  return Object.fromEntries(
    Object.entries(theme).filter(([key, value]) => value)
      .map(([key, value]) => [property[key] ?? `--theme-${key.toLowerCase()}`, value])
  )
})

export function injectTheme() {
  watchEffect((onInvalidate) => {
    const theme = unref(useTheme())
    const type = theme.type
    document.body.dataset.themeType = type
    onInvalidate(() => {
      delete document.body.dataset.themeType
    })
  })
  watchEffect((onInvalidate) => {
    const style = unref(themeStyleRef)
    const declarations = Object.entries(style)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection: Promise<string> = ipcRenderer.invoke('inject-style', `#root { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
