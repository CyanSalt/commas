import * as path from 'path'
import * as commas from 'commas:api/main'

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))

commas.context.provide('cli', {
  command: 'is',
  handler({ argv }, event) {
    switch (argv[0]) {
      case 'fun':
        event.sender.send('start-fun')
        return undefined
      default:
        return 'REALLY?!'
    }
  },
})