import * as commas from 'commas:api/main'
import type { EditorTheme } from '../../types/theme'

const theme = $(commas.settings.useTheme())

const editorTheme = $computed(() => {
  const backgroundRGBA = { ...commas.helper.toRGBA(theme.background), a: 1 }
  const foregroundRGBA = { ...commas.helper.toRGBA(theme.foreground), a: 1 }
  return {
    ...Object.fromEntries(Object.entries(commas.settings.THEME_CSS_COLORS).map(([key]) => {
      return [key, commas.helper.toCSSHEX(commas.helper.toRGBA(theme[key]))]
    })),
    background: commas.helper.toCSSHEX(backgroundRGBA),
    foreground: commas.helper.toCSSHEX(foregroundRGBA),
    type: theme.type,
    comment: commas.helper.toCSSHEX(commas.helper.mix(foregroundRGBA, backgroundRGBA, 0.5)),
    lineHighlight: commas.helper.toCSSHEX(commas.helper.mix(foregroundRGBA, backgroundRGBA, 0.2)),
    lineNumber: commas.helper.toCSSHEX(commas.helper.mix(foregroundRGBA, backgroundRGBA, 0.5)),
    activeLineNumber: commas.helper.toCSSHEX(foregroundRGBA),
  } as EditorTheme
})

function useEditorTheme() {
  return $$(editorTheme)
}

export {
  useEditorTheme,
}
