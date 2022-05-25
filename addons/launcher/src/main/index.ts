import * as commas from 'commas:api/main'
import { useLaunchers } from './launcher'

const launchersRef = useLaunchers()
commas.ipcMain.provide('launchers', launchersRef)

commas.settings.addSettingsSpecsFile('settings.spec.json')

commas.i18n.addTranslationDirectory('locales')
