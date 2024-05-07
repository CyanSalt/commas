import type { BaseEventPayload, ElementDragType } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types'

export type DraggableElementEventPayload<
  T = Record<string, unknown>,
  U = Record<string, unknown>,
> = BaseEventPayload<ElementDragType> & {
  source: {
    data: T,
  },
} & {
  self: {
    data: U,
  },
}
