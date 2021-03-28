import { computed, effect, ref, unref } from '@vue/reactivity'
import type { BrowserWindowConstructorOptions } from 'electron'
import { nativeTheme, systemPreferences } from 'electron'
import type { Theme } from '../../typings/theme'
import { toRGBA, toCSSColor, toElectronColor, isDarkColor, mix } from '../utils/color'
import { resources, userData } from '../utils/directory'
import { provideIPC } from '../utils/hooks'
import { useDefaultSettings, useSettings } from './settings'

interface BrowserWindowThemeOptions {
  backgroundColor: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'],
}

const defaultTheme = resources.require<Theme>('themes/oceanic-next.json')!

const themeRef = computed(async () => {
  const settings = unref(useSettings())
  const defaultSettings = unref(useDefaultSettings())
  let originalTheme = defaultTheme
  const name: string = settings['terminal.theme.name']
    || defaultSettings['terminal.theme.name']
  if (name !== defaultSettings['terminal.theme.name']) {
    const path = `themes/${name}.json`
    // TODO: memoize
    let source = resources.require<Theme>(path)
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

const themeOptionsRef = ref<BrowserWindowThemeOptions>({
  /** {@link https://github.com/electron/electron/issues/10420} */
  backgroundColor: '#00000000',
  vibrancy: undefined,
})

function useThemeOptions() {
  return themeOptionsRef
}

function handleThemeMessages() {
  effect(async () => {
    const loadingTheme = unref(themeRef)
    const theme = await loadingTheme
    const backgroundRGBA = toRGBA(theme.background!)
    themeOptionsRef.value = {
      backgroundColor: toElectronColor({ ...backgroundRGBA, a: 0 }),
      vibrancy: theme.opacity === 0 ? 'sidebar' : undefined,
    }
    // Enable system dark mode
    nativeTheme.themeSource = theme.type
  })
  provideIPC('theme', themeRef)
}

export {
  useThemeOptions,
  handleThemeMessages,
}
