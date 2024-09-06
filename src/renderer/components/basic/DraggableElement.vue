<script lang="ts" generic="T extends Record<string, unknown>" setup>
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import type { DraggableElementEventPayload } from '@commas/types/draggable'
import type { ComponentPublicInstance } from 'vue'
import { watchEffect } from 'vue'

const {
  data = (() => ({})) as never,
  disabled,
} = defineProps<{
  data?: T,
  disabled?: boolean,
}>()

const emit = defineEmits<{
  (event: 'dragstart', payload: DraggableElementEventPayload<T>): void,
  (event: 'drop', payload: DraggableElementEventPayload<T>): void,
}>()

let element = $ref<HTMLElement | null>()

watchEffect(onInvalidate => {
  if (!element) return
  onInvalidate(draggable({
    element,
    canDrag: () => !disabled,
    getInitialData: () => data,
    onDragStart: payload => {
      emit('dragstart', payload as DraggableElementEventPayload<T>)
    },
    onDrop: payload => {
      emit('drop', payload as DraggableElementEventPayload<T>)
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
