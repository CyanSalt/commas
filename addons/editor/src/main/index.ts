import * as path from 'node:path'
import * as commas from 'commas:api/main'
import { useEditorTheme } from './theme'

export default () => {

  commas.ipcMain.provide('editor-theme', useEditorTheme())

  commas.context.provide('cli.command', {
    command: 'edit',
    description: 'Edit a text file',
    usage: '<file>',
    handler({ sender, argv, cwd }) {
      sender.send('open-code-editor', path.join(cwd, argv[0]))
    },
  })

}
