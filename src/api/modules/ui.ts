import * as path from 'node:path'
import * as url from 'node:url'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import TabItem from '../../renderer/components/TabItem.vue'
import TerminalBlock from '../../renderer/components/TerminalBlock.vue'
import TerminalPane from '../../renderer/components/TerminalPane.vue'
import WebContents from '../../renderer/components/WebContents.vue'
import DraggableElement from '../../renderer/components/basic/DraggableElement.vue'
import DropIndicator from '../../renderer/components/basic/DropIndicator.vue'
import DropTarget from '../../renderer/components/basic/DropTarget.vue'
import LoadingSpinner from '../../renderer/components/basic/LoadingSpinner.vue'
import ObjectEditor from '../../renderer/components/basic/ObjectEditor.vue'
import SwitchControl from '../../renderer/components/basic/SwitchControl.vue'
import ValueSelector from '../../renderer/components/basic/ValueSelector.vue'
import VisualIcon from '../../renderer/components/basic/VisualIcon.vue'
import { createContextMenu, openContextMenu, withContextMenuSeparator } from '../../renderer/utils/frame'
import { vI18n } from '../../renderer/utils/i18n'
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
  DraggableElement,
  DropTarget,
  DropIndicator,
  SwitchControl,
  TerminalBlock,
  TerminalPane,
  ValueSelector,
  TabItem,
  WebContents,
}

export * from '../shim'

export {
  vueAssets,
  addCSSFile,
  openContextMenu,
  createContextMenu,
  withContextMenuSeparator,
  extractClosestEdge,
}
