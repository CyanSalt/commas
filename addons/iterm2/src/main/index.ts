import * as path from 'path'
import * as commas from 'commas:api/main'

commas.context.provide('cli', {
  command: 'attention',
  handler() {
    return '\x1b]1337;RequestAttention=fireworks\x1b\\'
  },
})

commas.keybinding.add({
  label: 'Set Mark#!iterm2.1',
  accelerator: 'CmdOrCtrl+Shift+M',
  command: 'set-mark',
})

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))
