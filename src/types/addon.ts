export interface AddonInfo {
  type: 'builtin' | 'user',
  name: string,
  entry: string,
  manifest: any,
}
