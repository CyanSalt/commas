import * as commas from 'commas:api/main'
import * as path from 'path'

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
