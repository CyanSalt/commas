import * as commas from 'commas:api/main'

commas.i18n.addTranslationDirectory('locales')

commas.context.provide('cli', {
  command: ',',
  handler(payload, event) {
    event.sender.send('unknown-start')
  },
})
