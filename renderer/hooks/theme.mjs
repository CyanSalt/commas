import { ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { computed, unref, watchEffect } from 'vue'
import { useRemoteData } from './remote.mjs'

export const useTheme = memoize(() => {
  return useRemoteData({}, {
    getter: 'get-theme',
    effect: 'theme-updated',
  })
})

const themeStyleRef = computed(() => {
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
  watchEffect((onCleanup) => {
    const theme = unref(useTheme())
    const type = theme.type
    document.body.dataset.themeType = type
    onCleanup(() => {
      delete document.body.dataset.themeType
    })
  })
  watchEffect((onCleanup) => {
    const style = unref(themeStyleRef)
    const declarations = Object.entries(style)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection = ipcRenderer.invoke('inject-style', `#root { ${declarations} }`)
    onCleanup(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
