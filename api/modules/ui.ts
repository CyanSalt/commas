import * as path from 'path'
import * as url from 'url'
import TabItem from '../../src/renderer/components/TabItem.vue'
import CodeEditor from '../../src/renderer/components/basic/CodeEditor.vue'
import LoadingSpinner from '../../src/renderer/components/basic/LoadingSpinner.vue'
import ObjectEditor from '../../src/renderer/components/basic/ObjectEditor.vue'
import SortableList from '../../src/renderer/components/basic/SortableList.vue'
import SwitchControl from '../../src/renderer/components/basic/SwitchControl.vue'
import TerminalPane from '../../src/renderer/components/basic/TerminalPane.vue'
import ValueSelector from '../../src/renderer/components/basic/ValueSelector.vue'
import { openContextMenu } from '../../src/renderer/utils/frame'
import { vI18n } from '../../src/renderer/utils/i18n'
import type { RendererAPIContext } from '../types'

function addCSSFile(this: RendererAPIContext, file: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url.pathToFileURL(path.resolve(this.__entry__, file)).href
  document.head.append(link)
  this.$.app.onCleanup(() => {
    link.remove()
  })
}

const vueAssets = {
  vI18n,
  CodeEditor,
  LoadingSpinner,
  ObjectEditor,
  SortableList,
  SwitchControl,
  TerminalPane,
  ValueSelector,
  TabItem,
}

export * from '../shim'

export {
  vueAssets,
  addCSSFile,
  openContextMenu,
}
