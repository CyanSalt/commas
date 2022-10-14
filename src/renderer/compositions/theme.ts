import { ipcRenderer } from 'electron'
import { computed, readonly, watchEffect } from 'vue'
import { surface } from '../../shared/compositions'
import { reuse } from '../../shared/helper'
import type { Theme } from '../../typings/theme'
import { injectIPC } from '../utils/compositions'

const theme = surface(
  injectIPC('theme', {
    variables: {},
    editor: {},
  } as Theme),
  true,
)

export function useTheme() {
  return theme
}

export const useEditorTheme = reuse(() => {
  return readonly(surface(
    computed(() => theme.editor),
  ))
})

export function injectTheme() {
  watchEffect((onInvalidate) => {
    const declarations = Object.entries(theme.variables)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const injection: Promise<string> = ipcRenderer.invoke('inject-style', `:root[data-commas] { ${declarations} }`)
    onInvalidate(async () => {
      ipcRenderer.invoke('eject-style', await injection)
    })
  })
}
