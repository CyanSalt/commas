<script lang="ts" generic="T extends Record<string, unknown>" setup>
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import type { ComponentPublicInstance } from 'vue'
import { watchEffect } from 'vue'
import type { DraggableElementEventPayload } from '../../../typings/draggable'

const {
  data = (() => ({})) as never,
  disabled,
  sticky,
  allowedEdges,
} = defineProps<{
  data?: T,
  disabled?: boolean,
  sticky?: boolean,
  allowedEdges?: Edge[],
}>()

const emit = defineEmits<{
  (event: 'dragenter', payload: DraggableElementEventPayload<any, T>): void,
  (event: 'drag', payload: DraggableElementEventPayload<any, T>): void,
  (event: 'dragleave', payload: DraggableElementEventPayload<any, T>): void,
  (event: 'drop', payload: DraggableElementEventPayload<any, T>): void,
}>()

let element = $ref<HTMLElement | null>()

watchEffect(onInvalidate => {
  if (!element) return
  onInvalidate(dropTargetForElements({
    element,
    canDrop: () => !disabled,
    getIsSticky: () => Boolean(sticky),
    getData: ({ input, element: currentElement }) => {
      let currentData = { ...data }
      if (allowedEdges) {
        currentData = attachClosestEdge(data, {
          input,
          element: currentElement,
          allowedEdges,
        }) as T
      }
      return currentData
    },
    onDragEnter: payload => {
      emit('dragenter', payload as DraggableElementEventPayload<any, T>)
    },
    onDrag: payload => {
      emit('drag', payload as DraggableElementEventPayload<any, T>)
    },
    onDragLeave: payload => {
      emit('dragleave', payload as DraggableElementEventPayload<any, T>)
    },
    onDrop: payload => {
      emit('drop', payload as DraggableElementEventPayload<any, T>)
    },
  }))
})

function mount(el: Element | ComponentPublicInstance | null) {
  element = el && '$el' in el ? el.$el : el
  return el
}
</script>

<template>
  <slot :mount="mount"></slot>
</template>
