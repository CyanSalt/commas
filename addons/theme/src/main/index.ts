import * as path from 'path'
import * as commas from 'commas:api/main'

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))
