import * as path from 'path'
import * as commas from 'commas:api/renderer'
import FireworkSlot from './firework-slot.vue'
import { ITerm2Addon } from './xterm'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.workspace.effectTerminalTab((tab, active) => {
  if (active && !tab.addons.iterm2) {
    tab.addons.iterm2 = new ITerm2Addon(tab)
    tab.xterm.loadAddon(tab.addons.iterm2)
  } else if (!active && tab.addons.iterm2) {
    tab.addons.iterm2.dispose()
    delete tab.addons.iterm2
  }
}, true)

commas.context.provide('@ui-slot', FireworkSlot)
