import * as path from 'path'
import * as commas from 'commas:api/renderer'
import FireworkSlot from './firework-slot.vue'
import { ITerm2Addon } from './xterm'
import './style.scss'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.workspace.registerXtermAddon('iterm2', tab => new ITerm2Addon(tab), true)

commas.context.provide('@ui-slot', FireworkSlot)

const currentTerminal = $(commas.workspace.useCurrentTerminal())

commas.ipcRenderer.on('set-mark', () => {
  if (!currentTerminal) return
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  currentTerminal.addons?.iterm2?.setMark()
})
