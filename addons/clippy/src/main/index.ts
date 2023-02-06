import * as commas from 'commas:api/main'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'clippy.assets.path': string,
    'clippy.agent.name': string,
  }
}

export default () => {

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
