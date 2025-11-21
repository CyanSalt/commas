import { watchEffect } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import type { Theme } from '@commas/types/theme'
import { surface } from '../../shared/composables'
import { injectIPC } from '../utils/composables'

const isLightTheme = injectIPC(
  'is-light-theme',
  matchMedia('(prefers-color-scheme: light)').matches,
)

export function useIsLightTheme() {
  return isLightTheme
}

const theme = surface(
  injectIPC('theme', {
    variables: {},
  } as Theme),
  true,
)

export function useTheme() {
  return theme
}

export function injectThemeStyle() {
  watchEffect((onInvalidate) => {
    const declarations = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection = ipcRenderer.invoke('inject-style', `:root[data-commas] { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
