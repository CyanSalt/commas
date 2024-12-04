import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import '@excalidraw/excalidraw/index.css'
// import type { RestoredDataState } from '@excalidraw/excalidraw/dist/excalidraw/data/restore'
// import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/dist/excalidraw/element/types'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RestoredDataState = import('@excalidraw/excalidraw/dist/excalidraw/data/restore').RestoredDataState
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type OrderedExcalidrawElement = import('@excalidraw/excalidraw/dist/excalidraw/element/types').OrderedExcalidrawElement
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type ExcalidrawImperativeAPI = import('@excalidraw/excalidraw/dist/excalidraw/types').ExcalidrawImperativeAPI

// ./dist/prod/index.js
const excalidrawEntryFile = require.resolve('@excalidraw/excalidraw')
window['EXCALIDRAW_ASSET_PATH'] = pathToFileURL(path.dirname(excalidrawEntryFile)).href

export * from '@excalidraw/excalidraw'

// export type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/excalidraw/types'
export type { ExcalidrawImperativeAPI }

export type State = Omit<RestoredDataState, 'elements'> & {
  elements: readonly OrderedExcalidrawElement[],
}
