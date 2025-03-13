import * as commas from 'commas:api/main'

export default () => {

  commas.context.provide('cli.command', {
    command: 'attention',
    description: 'Request attention from the current cursor#!cli.description.attention',
    handler() {
      return '\u001b]1337;RequestAttention=fireworks\u001b\\'
    },
  })

  commas.keybinding.addKeyBindingsFile('keybindings.json')

  commas.i18n.addTranslationDirectory('locales')

}
