import { computed, effect, unref } from '@vue/reactivity'
import { nativeTheme, systemPreferences } from 'electron'
import type { BrowserWindowConstructorOptions, TitleBarOverlay } from 'electron'
import { toRGBA, toCSSColor, toCSSHEX, toElectronHEX, isDarkColor, mix, toHSLA, toRGBAFromHSLA } from '../../shared/color'
import type { EditorTheme, Theme, ThemeDefinition } from '../../typings/theme'
import { provideIPC } from '../utils/compositions'
import { resourceFile, userFile } from '../utils/directory'
import { useDefaultSettings, useSettings } from './settings'

interface BrowserWindowThemeOptions {
  backgroundColor: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'],
  titleBarOverlay: TitleBarOverlay,
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
  systemYellow: '--system-yellow',
  systemGreen: '--system-green',
  systemCyan: '--system-cyan',
  systemBlue: '--system-blue',
  systemMagenta: '--system-magenta',
  systemAccent: '--system-accent',
  materialBackground: '--material-background',
  secondaryBackground: '--secondary-background',
}

const CSS_PROPERTIES: Partial<Record<Exclude<keyof Theme, keyof ThemeDefinition>, string>> = {
  opacity: '--theme-opacity',
}

const themeRef = computed(() => {
  const settings = useSettings()
  const defaultSettings = useDefaultSettings()
  const defaultThemeName = defaultSettings['terminal.theme.name']
  const defaultTheme: Required<ThemeDefinition> = require(resourceFile('themes', `${defaultThemeName}.json`))
  let originalTheme: ThemeDefinition = defaultTheme
  const name = settings['terminal.theme.name'] || defaultThemeName
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
  const customization: ThemeDefinition = settings['terminal.theme.customization']
  const opacity = settings['terminal.style.opacity']
  const theme = {
    ...defaultTheme,
    ...originalTheme,
    ...customization,
    name,
    opacity,
  } as Theme
  const backgroundRGBA = toRGBA(theme.background!)
  const foregroundRGBA = toRGBA(theme.foreground!)
  theme.background = toCSSColor({ ...backgroundRGBA, a: 1 })
  theme.type = isDarkColor(backgroundRGBA) ? 'dark' : 'light'
  let selectionBackgroundRGBA = theme.selectionBackground ? toRGBA(theme.selectionBackground) : undefined
  if (!selectionBackgroundRGBA || selectionBackgroundRGBA.a < 1) {
    selectionBackgroundRGBA = mix(foregroundRGBA, backgroundRGBA, 0.5)
    theme.selectionBackground = toCSSColor(selectionBackgroundRGBA)
  }
  if (!theme.cursor) {
    theme.cursor = theme.foreground
  }
  if (!theme.cursorAccent) {
    theme.cursorAccent = theme.background
  }
  const backgroundHSLA = toHSLA(backgroundRGBA)
  const materialBackgroundRGBA = toRGBAFromHSLA({
    ...backgroundHSLA,
    l: backgroundHSLA.l - Math.min(backgroundHSLA.l * 0.2, 0.1),
  })
  theme.materialBackground = toCSSColor(materialBackgroundRGBA)
  theme.secondaryBackground = toCSSColor(mix(backgroundRGBA, { r: 127, g: 127, b: 127, a: 1 }, 0.9))
  if (process.platform === 'darwin') {
    theme.systemRed = systemPreferences.getSystemColor('red')
    theme.systemYellow = systemPreferences.getSystemColor('yellow')
    theme.systemGreen = systemPreferences.getSystemColor('green')
    // theme.systemCyan = systemPreferences.getSystemColor('cyan')
    theme.systemBlue = systemPreferences.getSystemColor('blue')
    theme.systemMagenta = systemPreferences.getSystemColor('pink')
  }
  const accentColor = systemPreferences.getAccentColor()
  theme.systemAccent = accentColor ? `#${accentColor.slice(0, 6)}` : ''
  theme.vibrancy = process.platform === 'darwin' ? settings['terminal.style.vibrancy'] : false
  theme.variables = Object.fromEntries([
    ...Object.entries({ ...THEME_CSS_COLORS, ...EXTRA_CSS_COLORS }).map(([key, attr]) => {
      let value = theme[key]
      if (value) {
        const rgba = toRGBA(theme[key])
        value = `${rgba.r} ${rgba.g} ${rgba.b}`
      }
      return [attr, value]
    }),
    ...Object.entries(CSS_PROPERTIES).map(([key, attr]) => [attr, theme[key]]),
  ].filter(([key, value]) => value !== undefined))
  theme.editor = {
    ...Object.fromEntries(Object.entries(THEME_CSS_COLORS).map(([key]) => {
      return [key, toCSSHEX(toRGBA(theme[key]))]
    })),
    type: theme.type,
    comment: toCSSHEX(mix(foregroundRGBA, backgroundRGBA, 0.5)),
    lineHighlight: toCSSHEX(mix(foregroundRGBA, backgroundRGBA, 0.2)),
    lineNumber: toCSSHEX(mix(foregroundRGBA, backgroundRGBA, 0.5)),
    activeLineNumber: toCSSHEX(foregroundRGBA),
  } as EditorTheme
  return theme
})

const themeOptionsRef = computed<BrowserWindowThemeOptions>(() => {
  const theme = unref(themeRef)
  const foregroundRGBA = toRGBA(theme.foreground!)
  const backgroundRGBA = toRGBA(theme.background!)
  const materialBackgroundRGBA = toRGBA(theme.materialBackground!)
  return {
    /** {@link https://github.com/electron/electron/issues/10420} */
    backgroundColor: toElectronHEX({ ...backgroundRGBA, a: process.platform !== 'win32' ? 0 : 1 }),
    vibrancy: theme.vibrancy ? 'sidebar' : undefined,
    titleBarOverlay: {
      color: toElectronHEX(materialBackgroundRGBA),
      symbolColor: toElectronHEX({ ...foregroundRGBA, a: 1 }),
      height: 36,
    },
  }
})

function useTheme() {
  return themeRef
}

function useThemeOptions() {
  return themeOptionsRef
}

function handleThemeMessages() {
  effect(() => {
    const theme = unref(themeRef)
    // Enable system dark mode
    nativeTheme.themeSource = theme.type
  })
  provideIPC('theme', themeRef)
}

export {
  useTheme,
  useThemeOptions,
  handleThemeMessages,
}
