import * as path from 'node:path'
import * as url from 'node:url'
import TabItem from '../../src/renderer/components/TabItem.vue'
import TerminalBlock from '../../src/renderer/components/TerminalBlock.vue'
import TerminalPane from '../../src/renderer/components/TerminalPane.vue'
import LoadingSpinner from '../../src/renderer/components/basic/LoadingSpinner.vue'
import ObjectEditor from '../../src/renderer/components/basic/ObjectEditor.vue'
import SortableList from '../../src/renderer/components/basic/SortableList.vue'
import SwitchControl from '../../src/renderer/components/basic/SwitchControl.vue'
import ValueSelector from '../../src/renderer/components/basic/ValueSelector.vue'
import VisualIcon from '../../src/renderer/components/basic/VisualIcon.vue'
import { createContextMenu, openContextMenu } from '../../src/renderer/utils/frame'
import { vI18n } from '../../src/renderer/utils/i18n'
import type { RendererAPIContext } from '../types'

function addCSSFile(this: RendererAPIContext, file: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  let fileURL: URL
  try {
    fileURL = new URL(file)
  } catch {
    fileURL = url.pathToFileURL(path.resolve(this.__entry__, file))
  }
  link.href = fileURL.href
  document.head.append(link)
  this.$.app.onInvalidate(() => {
    link.remove()
  })
}

const vueAssets = {
  vI18n,
  LoadingSpinner,
  VisualIcon,
  ObjectEditor,
  SortableList,
  SwitchControl,
  TerminalBlock,
  TerminalPane,
  ValueSelector,
  TabItem,
}

export * from '../shim'

export {
  vueAssets,
  addCSSFile,
  openContextMenu,
  createContextMenu,
}
