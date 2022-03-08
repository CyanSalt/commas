import * as url from 'url'
import { openContextMenu } from '../../renderer/utils/frame'
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

export * from '../shim'

export {
  addCSSFile,
  openContextMenu,
}
