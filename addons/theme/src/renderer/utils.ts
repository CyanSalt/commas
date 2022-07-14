import type { ThemeDefinition } from '../../../../src/typings/theme'

export interface RemoteTheme extends ThemeDefinition {
  name: string,
  meta: {
    isDark: boolean,
  },
}

export async function fetchThemeList() {
  const response = await fetch(`https://www.atomcorp.dev/api/v1/themes`)
  return await response.json() as RemoteTheme[]
}
