import { ipcRenderer } from 'electron'
import { computed, readonly, unref, watchEffect } from 'vue'
import { surface } from '../../shared/compositions'
import type { Theme } from '../../typings/theme'
import { injectIPC } from '../utils/compositions'

const themeRef = injectIPC('theme', {
  variables: {},
  editor: {},
} as Theme)
const theme = surface(themeRef, true)

export function useTheme() {
  return theme
}

const editorThemeRef = computed(() => unref(themeRef).editor)
const editorTheme = readonly(surface(editorThemeRef))

export function useEditorTheme() {
  return editorTheme
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
