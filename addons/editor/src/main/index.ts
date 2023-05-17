import * as fs from 'node:fs'
import * as path from 'node:path'
import * as commas from 'commas:api/main'
import { useEditorTheme } from './theme'

export default () => {

  commas.ipcMain.provide('editor-theme', useEditorTheme())

  commas.context.provide('cli.command', {
    command: 'edit',
    description: 'Edit a text file#!cli.description.edit',
    usage: '<file>#!cli.usage.edit',
    async handler({ sender, argv, cwd }) {
      const file = path.join(cwd, argv[0])
      await fs.promises.access(file, fs.constants.R_OK)
      sender.send('open-code-editor', file)
    },
  })

  commas.i18n.addTranslationDirectory('locales')

}
