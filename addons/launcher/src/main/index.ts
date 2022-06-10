import * as commas from 'commas:api/main'
import { useLaunchers } from './launcher'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'launcher.session.persist'?: boolean,
  }
}

export default () => {

  const launchersRef = useLaunchers()
  commas.ipcMain.provide('launchers', launchersRef)

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
