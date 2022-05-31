import * as commas from 'commas:api/main'

export default () => {

  commas.context.provide('cli', {
    command: 'attention',
    handler() {
      return '\x1b]1337;RequestAttention=fireworks\x1b\\'
    },
  })

  commas.keybinding.addKeyBindingsFile('keybindings.json')

  commas.i18n.addTranslationDirectory('locales')

}
