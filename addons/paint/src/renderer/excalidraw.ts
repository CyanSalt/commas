import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import '@excalidraw/excalidraw/index.css'
import type { RestoredDataState } from '@excalidraw/excalidraw/dist/excalidraw/data/restore'
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/dist/excalidraw/element/types'

// ./dist/prod/index.js
const excalidrawEntryFile = require.resolve('@excalidraw/excalidraw')
window['EXCALIDRAW_ASSET_PATH'] = pathToFileURL(path.dirname(excalidrawEntryFile)).href

export * from '@excalidraw/excalidraw'

export type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/excalidraw/types'

export type State = Omit<RestoredDataState, 'elements'> & {
  elements: readonly OrderedExcalidrawElement[],
}
