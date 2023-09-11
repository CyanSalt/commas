import * as commas from 'commas:api/main'
import type { EditorTheme } from '../typings/theme'

const theme = $(commas.settings.useTheme())

const editorTheme = $computed(() => {
  const backgroundRGBA = commas.helper.toRGBA(theme.background!)
  const foregroundRGBA = commas.helper.toRGBA(theme.foreground!)
  return {
    ...Object.fromEntries(Object.entries(commas.settings.THEME_CSS_COLORS).map(([key]) => {
      return [key, commas.helper.toCSSHEX(commas.helper.toRGBA(theme[key]))]
    })),
    type: theme.type,
    comment: commas.helper.toCSSHEX({
      ...commas.helper.mix(foregroundRGBA, backgroundRGBA, 0.5),
      a: 1,
    }),
    lineHighlight: commas.helper.toCSSHEX({
      ...commas.helper.mix(foregroundRGBA, backgroundRGBA, 0.2),
      a: 1,
    }),
    lineNumber: commas.helper.toCSSHEX({
      ...commas.helper.mix(foregroundRGBA, backgroundRGBA, 0.5),
      a: 1,
    }),
    activeLineNumber: commas.helper.toCSSHEX(foregroundRGBA),
  } as EditorTheme
})

function useEditorTheme() {
  return $$(editorTheme)
}

export {
  useEditorTheme,
}
