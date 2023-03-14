import { ipcRenderer } from 'electron'
import { watchEffect } from 'vue'
import { surface } from '../../shared/compositions'
import type { Theme } from '../../typings/theme'
import { injectIPC } from '../utils/compositions'

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
    const injection: Promise<string> = ipcRenderer.invoke('inject-style', `:root[data-commas] { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
