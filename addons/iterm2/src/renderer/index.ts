import * as path from 'path'
import * as commas from 'commas:api/renderer'
import FireworkSlot from './firework-slot.vue'
import { ITerm2Addon } from './xterm'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.workspace.registerXtermAddon('iterm2', tab => new ITerm2Addon(tab), true)

commas.context.provide('@ui-slot', FireworkSlot)
