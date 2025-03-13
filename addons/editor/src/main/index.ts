import * as fs from 'node:fs'
import * as path from 'node:path'
import * as commas from 'commas:api/main'
import { useEditorTheme } from './theme'

declare module '@commas/electron-ipc' {
  export interface Refs {
    'editor-theme': ReturnType<typeof useEditorTheme>,
  }
}

export default () => {

  commas.ipcMain.provide('editor-theme', useEditorTheme())

  commas.context.provide('cli.command', {
    command: 'edit',
    description: 'Edit a text file#!cli.description.edit',
    args: {
      name: 'file',
      generators: {
        template: 'filepaths',
      },
    },
    async handler({ sender, argv, cwd }) {
      const file = path.resolve(cwd, argv[0])
      await fs.promises.access(file, fs.constants.R_OK)
      commas.frame.send(sender, 'open-code-editor', file)
    },
  })

  commas.i18n.addTranslationDirectory('locales')

}
