import path from 'path'
import * as commas from 'commas:api/main'

commas.settings.addSettingsSpecs(require('../../settings.spec.json'))

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))
