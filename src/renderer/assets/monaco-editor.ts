import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js'
import 'monaco-editor/esm/vs/language/css/monaco.contribution.js'
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js'
import 'monaco-editor/esm/vs/editor/editor.all.js'

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker'
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'

export * from 'monaco-editor/esm/vs/editor/editor.api.js'

declare global {
  interface Window {
    MonacoEnvironment: {
      getWorker(workerId: string, label: string): Worker,
    },
  }
}

window.MonacoEnvironment = {
  getWorker(workerId, label) {
    switch (label) {
      case 'css':
        return new CSSWorker()
      case 'javascript':
        return new TSWorker()
      default:
        return new EditorWorker()
    }
  },
}
