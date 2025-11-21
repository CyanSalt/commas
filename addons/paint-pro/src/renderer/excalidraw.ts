import '@excalidraw/excalidraw/index.css'
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/dist/types/element/src/types'
import type { RestoredDataState } from '@excalidraw/excalidraw/dist/types/excalidraw/data/restore'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/types/excalidraw/types'

export * from '@excalidraw/excalidraw'

// export type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/excalidraw/types'
export type { ExcalidrawImperativeAPI }

export type State = Omit<RestoredDataState, 'elements'> & {
  elements: readonly OrderedExcalidrawElement[],
}
