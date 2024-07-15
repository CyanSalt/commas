import type { ThemeDefinition } from '@commas/types/theme'

export interface RemoteTheme extends ThemeDefinition {
  name: string,
  meta: {
    isDark: boolean,
  },
}

export async function fetchThemeList() {
  const response = await fetch(`https://2zrysvpla9.execute-api.eu-west-2.amazonaws.com/prod/themes`)
  return await response.json() as RemoteTheme[]
}
