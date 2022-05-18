import { computed, effect, ref, unref } from '@vue/reactivity'
import { nativeTheme, systemPreferences } from 'electron'
import type { BrowserWindowConstructorOptions } from 'electron'
import type { Theme } from '../../../typings/theme'
import { toRGBA, toCSSColor, toElectronColor, isDarkColor, mix, toHSLA, toRGBAFromHSLA } from '../utils/color'
import { provideIPC } from '../utils/compositions'
import { resources, userData } from '../utils/directory'
import { useDefaultSettings, useSettings } from './settings'

interface BrowserWindowThemeOptions {
  backgroundColor: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'],
}

const CSS_COLORS: Partial<Record<keyof Theme, string>> = {
  // xterm
  foreground: '--theme-foreground',
  background: '--theme-background',
  selection: '--theme-selection',
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
  materialBackground: '--material-background',
  secondaryBackground: '--secondary-background',
}

const CSS_PROPERTIES = {
  // extensions
  opacity: '--theme-opacity',
}

const themeRef = computed(async () => {
  const settings = useSettings()
  const defaultSettings = useDefaultSettings()
  const defaultThemeName = defaultSettings['terminal.theme.name']
  let originalTheme = resources.require<Theme>(`themes/${defaultThemeName}.json`)!
  const name: string = settings['terminal.theme.name'] || defaultThemeName
  if (name !== defaultThemeName) {
    const path = `themes/${name}.json`
    // TODO: memoize
    let source = resources.require<Theme>(path)
    if (!source) {
      source = userData.require<Theme>(path)
    }
    if (source) {
      originalTheme = source
    }
  }
  const customization: Partial<Theme> = settings['terminal.theme.customization']
  const theme: Theme = {
    ...originalTheme,
    ...customization,
    name,
  }
  const opacity: number = settings['terminal.style.opacity']
  const backgroundRGBA = toRGBA(theme.background!)
  theme.opacity = opacity
  theme.background = toCSSColor({ ...backgroundRGBA, a: 1 })
  if (!['dark', 'light'].includes(theme.type)) {
    const isDark = isDarkColor(backgroundRGBA)
    theme.type = isDark ? 'dark' : 'light'
  }
  if (!theme.selection || toRGBA(theme.selection).a < 1) {
    theme.selection = toCSSColor(mix(toRGBA(theme.foreground!), backgroundRGBA, 0.5))
  }
  if (!theme.cursor) {
    theme.cursor = theme.foreground
  }
  if (!theme.cursorAccent) {
    theme.cursorAccent = theme.background
  }
  const backgroundHSLA = toHSLA(backgroundRGBA)
  theme.materialBackground = toCSSColor(toRGBAFromHSLA({
    ...backgroundHSLA,
    l: backgroundHSLA.l - Math.min(backgroundHSLA.l * 0.2, 0.1),
  }))
  theme.secondaryBackground = toCSSColor(mix(backgroundRGBA, { r: 127, g: 127, b: 127, a: 1 }, 0.9))
  const accentColor = systemPreferences.getAccentColor()
  theme.systemAccent = accentColor ? `#${accentColor.slice(0, 6)}` : ''
  theme.vibrancy = process.platform === 'darwin' ? settings['terminal.style.vibrancy'] : false
  if (theme.vibrancy) {
    theme.opacity = (1 - (1 - theme.opacity) ** 0.5)
  }
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
      vibrancy: theme.vibrancy ? 'sidebar' : undefined,
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