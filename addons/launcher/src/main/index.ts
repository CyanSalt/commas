import * as path from 'path'
import * as commas from 'commas:api/main'
import { useLaunchers } from './launcher'

const launchersRef = useLaunchers()
commas.ipcMain.provide('launchers', launchersRef)

commas.settings.addSettingsSpecs(require('../../settings.spec.json'))

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))
