import { computed, unref, watchEffect } from 'vue'
import { memoize } from 'lodash-es'
import { useRemoteData } from './remote'
import { useSettings } from './settings'
import { rgba, rgb, distance, hasAlphaChannel, mix } from '../utils/theme'

/**
 * @typedef {import('../utils/theme').Theme} Theme
 */

export const useRawTheme = memoize(() => {
  return useRemoteData({}, {
    getter: 'get-theme',
    effect: 'theme-updated',
  })
})

const themeRef = computed(() => {
  const settings = unref(useSettings())
  const rawTheme = unref(useRawTheme())
  if (!rawTheme.name) return rawTheme
  const customization = settings['terminal.theme.customization']
  /** @type {Theme} */
  const theme = {
    ...rawTheme,
    ...customization,
  }
  const opacity = settings['terminal.style.opacity']
  if (theme.background && opacity < 1 && opacity > 0) {
    theme.background = rgba(theme.background, opacity)
  }
  theme.backdrop = theme.background
  theme.background = rgb(theme.backdrop)
  theme.type = distance(theme.background, '#000') < distance(theme.background, '#fff')
    ? 'dark' : 'light'
  if (!theme.selection || !hasAlphaChannel(theme.selection)) {
    const weight = theme.type === 'light' ? 0.15 : 0.3
    theme.selection = mix(theme.foreground, theme.background, weight)
  }
  if (!theme.cursor) theme.cursor = theme.foreground
  if (!theme.cursorAccent) theme.cursorAccent = theme.background
  return theme
})

export function useTheme() {
  return themeRef
}

const themeStyleRef = computed(() => {
  const theme = unref(themeRef)
  return Object.fromEntries(
    Object.entries(theme).filter(([key, value]) => value)
      .map(([key, value]) => [`--theme-${key.toLowerCase()}`, value])
  )
})

export function injectTheme() {
  watchEffect((onInvalidate) => {
    const theme = unref(themeRef)
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
    const element = document.createElement('style')
    element.appendChild(document.createTextNode(`#root { ${declarations} }`))
    document.head.appendChild(element)
    onInvalidate(() => {
      element.remove()
    })
  })
}
