import * as commas from 'commas:api/main'

declare module '@commas/types/settings' {
  export interface Settings {
    'paint-pro.assets.path': string,
  }
}

export default () => {

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
