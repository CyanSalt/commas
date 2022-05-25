import * as commas from 'commas:api/main'

commas.i18n.addTranslationDirectory('locales')

commas.context.provide('cli', {
  command: 'is',
  handler({ argv }, event) {
    switch (argv[0]) {
      case 'fun':
        event.sender.send('start-fun')
        return undefined
      default:
        return argv[0]
          ? 'Thanks, but aren\'t I fun?'
          : 'What do you think of me? Maybe you\'ll find me fun?'
    }
  },
})
