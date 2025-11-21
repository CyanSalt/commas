import { effect } from '@vue/reactivity'
import type { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { nativeTheme, systemPreferences } from 'electron'
import type { Theme, ThemeDefinition } from '@commas/types/theme'
import { isDarkColor, mix, toCSSColor, toCSSHEX, toElectronHEX, toRGBA } from '../../shared/color'
import { provideIPC } from '../utils/composables'
import { resourceFile, userFile } from '../utils/directory'
import { useDefaultSettings, useSettings } from './settings'

declare module '@commas/electron-ipc' {
  export interface Refs {
    theme: typeof theme,
    'is-light-theme': typeof isLightTheme,
  }
}

interface BrowserWindowThemeOptions {
  backgroundColor: NonNullable<BrowserWindowConstructorOptions['backgroundColor']>,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'],
  titleBarOverlay: Extract<BrowserWindowConstructorOptions['titleBarOverlay'], object>,
  windowButtonPosition: ReturnType<BrowserWindow['getWindowButtonPosition']>,
}

const THEME_CSS_COLORS: Partial<Record<keyof ThemeDefinition, string>> = {
  foreground: '--theme-foreground',
  background: '--theme-background',
  selectionBackground: '--theme-selectionbackground',
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
}

const EXTRA_CSS_COLORS: Partial<Record<Exclude<keyof Theme, keyof ThemeDefinition>, string>> = {
  systemRed: '--system-red',
  systemOrange: '--system-orange',
  systemYellow: '--system-yellow',
  systemGreen: '--system-green',
  systemMint: '--system-mint',
  systemTeal: '--system-teal',
  systemCyan: '--system-cyan',
  systemBlue: '--system-blue',
  systemIndigo: '--system-indigo',
  systemPurple: '--system-purple',
  systemPink: '--system-pink',
  systemBrown: '--system-brown',
  systemGray: '--system-gray',
  systemAccent: '--system-accent',
}

const settings = useSettings()

const systemAccentColor = $customRef((track, trigger) => {
  let color = systemPreferences.getAccentColor()
  if (process.platform === 'win32') {
    systemPreferences.on('accent-color-changed', (event, newColor) => {
      color = newColor
      trigger()
    })
  } else if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification('AppleColorPreferencesChangedNotification', () => {
      color = systemPreferences.getAccentColor()
      trigger()
    })
  }
  return {
    get() {
      track()
      return color
    },
    set() {
      // ignore
    },
  }
})

const isLightTheme = $customRef((track, trigger) => {
  effect(() => {
    nativeTheme.themeSource = settings['terminal.theme.type']
  })
  let shouldUseLight = !nativeTheme.shouldUseDarkColors
  nativeTheme.on('updated', () => {
    shouldUseLight = !nativeTheme.shouldUseDarkColors
    trigger()
  })
  return {
    get() {
      track()
      return shouldUseLight
    },
    set(value) {
      if (value !== shouldUseLight) {
        settings['terminal.theme.type'] = value ? 'light' : 'dark'
      }
    },
  }
})

const theme = $computed(() => {
  const defaultSettings = useDefaultSettings()
  const defaultThemeName = isLightTheme
    ? defaultSettings['terminal.theme.lightName']
    : defaultSettings['terminal.theme.name']
  const defaultTheme: Required<ThemeDefinition> = require(resourceFile('themes', `${defaultThemeName}.json`))
  let originalTheme: ThemeDefinition = defaultTheme
  const name = (
    isLightTheme
      ? settings['terminal.theme.lightName']
      : settings['terminal.theme.name']
  ) || defaultThemeName
  if (name !== defaultThemeName) {
    const path = `themes/${name}.json`
    let source: ThemeDefinition | undefined
    try {
      source = require(resourceFile(path))
    } catch {
      try {
        source = require(userFile(path))
      } catch {
        // ignore error
      }
    }
    if (source) {
      originalTheme = source
    }
  }
  const customization: ThemeDefinition = isLightTheme
    ? settings['terminal.theme.lightCustomization']
    : settings['terminal.theme.customization']
  const userTheme = {
    ...originalTheme,
    ...customization,
  }
  const vibrancy = process.platform === 'darwin' ? settings['terminal.style.vibrancy'] : false
  const opacity = settings['terminal.style.opacity']
  const definition = {
    ...defaultTheme,
    ...userTheme,
    name,
    opacity,
  } as Theme
  const backgroundRGBA = toRGBA(definition.background)
  const foregroundRGBA = toRGBA(definition.foreground)
  definition.background = toCSSHEX({ ...backgroundRGBA, a: opacity < 1 ? 0 : 1 })
  definition.type = isDarkColor(backgroundRGBA) ? 'dark' : 'light'
  let selectionBackgroundRGBA = definition.selectionBackground ? toRGBA(definition.selectionBackground) : undefined
  if (!selectionBackgroundRGBA || selectionBackgroundRGBA.a < 1) {
    selectionBackgroundRGBA = mix(foregroundRGBA, backgroundRGBA, 0.5)
    definition.selectionBackground = toCSSColor(selectionBackgroundRGBA)
  }
  if (!userTheme.magenta && userTheme.purple) {
    definition.magenta = userTheme.purple
  }
  if (!userTheme.brightMagenta && userTheme.brightPurple) {
    definition.brightMagenta = userTheme.brightPurple
  }
  if (!userTheme.cursor) {
    definition.cursor = userTheme.cursorColor ?? definition.foreground
  }
  if (!userTheme.cursorAccent) {
    definition.cursorAccent = toCSSHEX({ ...backgroundRGBA, a: 1 })
  }
  // if (process.platform === 'darwin') {
  //   definition.systemRed = systemPreferences.getSystemColor('red')
  //   definition.systemOrange = systemPreferences.getSystemColor('orange')
  //   definition.systemYellow = systemPreferences.getSystemColor('yellow')
  //   definition.systemGreen = systemPreferences.getSystemColor('green')
  //   definition.systemBlue = systemPreferences.getSystemColor('blue')
  //   definition.systemPurple = systemPreferences.getSystemColor('purple')
  //   definition.systemPink = systemPreferences.getSystemColor('pink')
  //   definition.systemBrown = systemPreferences.getSystemColor('brown')
  //   definition.systemGray = systemPreferences.getSystemColor('gray')
  // }
  const accentColor = settings['terminal.style.accentColor'] || (
    systemAccentColor ? `#${systemAccentColor.slice(0, 6)}` : ''
  )
  const accentRGBA = accentColor ? toRGBA(accentColor) : undefined
  definition.systemAccent = accentRGBA ? toCSSHEX(accentRGBA) : ''
  definition.vibrancy = opacity < 1 ? undefined : vibrancy
  definition.variables = Object.fromEntries([
    ...Object.entries({ ...THEME_CSS_COLORS, ...EXTRA_CSS_COLORS }).map(([key, attr]) => {
      let value = definition[key]
      if (value) {
        const rgba = toRGBA(definition[key])
        value = `${rgba.r} ${rgba.g} ${rgba.b}`
      } else {
        value = undefined
      }
      return [attr, value]
    }),
    ['--theme-opacity', `${opacity * 100}%`],
  ].filter(([key, value]) => value !== undefined))
  return definition
})

const defaultWindowButtonPosition = {
  x: 12,
  y: 11,
  // width: 56,
}

const themeOptions = $computed<BrowserWindowThemeOptions>(() => {
  const foregroundRGBA = toRGBA(theme.foreground)
  const backgroundRGBA = toRGBA(theme.background)
  const trafficLightOffset = ((36 + 8 * 2) - 36) / 2
  return {
    /** {@link https://github.com/electron/electron/issues/10420} */
    backgroundColor: toElectronHEX({ ...backgroundRGBA, a: process.platform !== 'win32' ? 0 : 1 }),
    vibrancy: theme.vibrancy ? (
      typeof theme.vibrancy === 'string' ? theme.vibrancy : 'hud'
    ) : undefined,
    titleBarOverlay: {
      color: toElectronHEX(backgroundRGBA),
      symbolColor: toElectronHEX({ ...foregroundRGBA, a: 1 }),
      height: 36,
    },
    windowButtonPosition: settings['terminal.view.tabListPosition'] === 'top'
      ? { x: defaultWindowButtonPosition.x + trafficLightOffset, y: defaultWindowButtonPosition.y + trafficLightOffset }
      : defaultWindowButtonPosition,
  }
})

function useTheme() {
  return $$(theme)
}

function useThemeOptions() {
  return $$(themeOptions)
}

function handleThemeMessages() {
  provideIPC('is-light-theme', $$(isLightTheme))
  provideIPC('theme', $$(theme))
}

export {
  THEME_CSS_COLORS,
  useTheme,
  useThemeOptions,
  handleThemeMessages,
}
