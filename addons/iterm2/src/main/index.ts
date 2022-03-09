import * as path from 'path'
import * as commas from 'commas:api/main'

commas.context.provide('cli', {
  command: 'attention',
  handler() {
    return '\x1b]1337;RequestAttention=fireworks\x1b\\'
  },
})

commas.keybinding.addKeyBindings(require('../../keybindings.json'))

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))
