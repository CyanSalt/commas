import { computed, effect, unref } from '@vue/reactivity'
import { nativeTheme, systemPreferences } from 'electron'
import type { Theme } from '../../typings/theme'
import { toRGBA, toCSSColor, toElectronColor, isDarkColor, mix } from '../utils/color'
import { resources, userData } from '../utils/directory'
import { provideIPC } from '../utils/hooks'
import { getDefaultSettings, useSettings } from './settings'
import { setThemeOptions } from './window'

const defaultTheme = resources.require<Theme>('themes/oceanic-next.json')!

const themeRef = computed(async () => {
  const settingsRef = useSettings()
  let originalTheme = defaultTheme
  const settings = await unref(settingsRef)
  const defaultSettings = getDefaultSettings()
  const name: string = settings['terminal.theme.name']
    || defaultSettings['terminal.theme.name']
  if (name !== defaultSettings['terminal.theme.name']) {
    const path = `themes/${name}.json`
    let source = await resources.load<Theme>(path)
    if (!source) source = await userData.load<Theme>(path)
    if (source) originalTheme = source
  }
  const customization: Partial<Theme> = settings['terminal.theme.customization']
  const theme: Theme = {
    ...originalTheme,
    ...customization,
    name,
  }
  const opacity: number = settings['terminal.style.opacity']
  const backgroundRGBA = toRGBA(theme.background!)
  const isDark = isDarkColor(backgroundRGBA)
  theme.type = isDark ? 'dark' : 'light'
  theme.opacity = opacity
  theme.background = toCSSColor({ ...backgroundRGBA, a: 1 })
  theme.backdrop = opacity < 1 ? toCSSColor({
    ...backgroundRGBA,
    a: opacity,
  }) : theme.background
  if (!theme.selection || toRGBA(theme.selection).a < 1) {
    theme.selection = toCSSColor(mix(toRGBA(theme.foreground!), backgroundRGBA, 0.5))
  }
  if (!theme.cursor) {
    theme.cursor = theme.foreground
  }
  if (!theme.cursorAccent) {
    theme.cursorAccent = theme.background
  }
  const accentColor = systemPreferences.getAccentColor()
  theme.systemAccent = accentColor ? `#${accentColor.slice(0, 6)}` : ''
  return theme
})

function handleThemeMessages() {
  effect(async () => {
    const theme = await unref(themeRef)
    const backgroundRGBA = toRGBA(theme.background!)
    setThemeOptions({
      backgroundColor: toElectronColor({ ...backgroundRGBA, a: 0 }),
      vibrancy: theme.opacity === 0 ? 'sidebar' : undefined,
    })
    // Enable system dark mode
    nativeTheme.themeSource = theme.type
  })
  provideIPC('theme', themeRef)
}

export {
  handleThemeMessages,
}
