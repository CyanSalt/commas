import * as commas from 'commas:api/main'

export default () => {

  commas.context.provide('cli.command', {
    command: 'browse',
    description: 'Browse URL#!cli.description.browse',
    usage: '<url>#!cli.usage.browse',
    async handler({ sender, argv }) {
      commas.frame.send(sender, 'open-browser', argv[0])
    },
  })

  commas.i18n.addTranslationDirectory('locales')

  commas.keybinding.addKeyBindingsFile('keybindings.json')

}
