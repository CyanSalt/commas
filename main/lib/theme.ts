import { computed, effect, ref, unref } from '@vue/reactivity'
import { nativeTheme, systemPreferences } from 'electron'
import { toRGBA, toCSSColor, toElectronColor, isDarkColor, mix } from '../utils/color'
import { resources, userData } from '../utils/directory'
import { provideIPC } from '../utils/hooks'
import { useDefaultSettings, useSettings } from './settings'
import type { Theme } from '../../typings/theme'
import type { BrowserWindowConstructorOptions } from 'electron'

interface BrowserWindowThemeOptions {
  backgroundColor: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'],
}

const CSS_COLORS = {
  // xterm
  foreground: '--theme-foreground',
  background: '--theme-background',
  black: '--theme-black',
  red: '--theme-red',
  green: '--theme-green',
  yellow: '--theme-yellow',
  blue: '--theme-blue',
  magenta: '--theme-magenta',
  cyan: '--theme-cyan',
  white: '--theme-white',
  brightBlack: '--theme-brightblack',
  brightRed: '--theme-brightred',
  brightGreen: '--theme-brightgreen',
  brightYellow: '--theme-brightyellow',
  brightBlue: '--theme-brightblue',
  brightMagenta: '--theme-brightmagenta',
  brightCyan: '--theme-brightcyan',
  brightWhite: '--theme-brightwhite',
  // extensions
  systemAccent: '--system-accent',
}

const CSS_PROPERTIES = {
  // xterm
  selection: '--theme-selection',
  // extensions
  opacity: '--theme-opacity',
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
  theme.variables = Object.fromEntries([
    ...Object.entries(CSS_COLORS).map(([key, attr]) => {
      let value = theme[key]
      if (value) {
        const rgba = toRGBA(theme[key])
        value = `${rgba.r} ${rgba.g} ${rgba.b}`
      }
      return [attr, value]
    }),
    ...Object.entries(CSS_PROPERTIES).map(([key, attr]) => [attr, theme[key]]),
  ].filter(([key, value]) => value !== undefined))
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
