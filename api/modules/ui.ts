import * as url from 'url'
import LoadingSpinner from '../../renderer/components/basic/loading-spinner.vue'
import ObjectEditor from '../../renderer/components/basic/object-editor.vue'
import SortableList from '../../renderer/components/basic/sortable-list.vue'
import SwitchControl from '../../renderer/components/basic/switch-control.vue'
import TerminalPane from '../../renderer/components/basic/terminal-pane.vue'
import ValueSelector from '../../renderer/components/basic/value-selector.vue'
import TabItem from '../../renderer/components/tab-item.vue'
import { openContextMenu } from '../../renderer/utils/frame'
import { vI18n } from '../../renderer/utils/i18n'
import type { RendererAPIContext } from '../types'

function addCSSFile(this: RendererAPIContext, file: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url.pathToFileURL(file).href
  document.head.append(link)
  this.$.app.onCleanup(() => {
    link.remove()
  })
}

const vueAssets = {
  vI18n,
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
