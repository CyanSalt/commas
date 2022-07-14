import type { ThemeDefinition } from '../../../../src/typings/theme'

export async function fetchThemeList() {
  const response = await fetch(`https://www.atomcorp.dev/api/v1/themes`)
  return await response.json() as (ThemeDefinition & { name: string })[]
}
