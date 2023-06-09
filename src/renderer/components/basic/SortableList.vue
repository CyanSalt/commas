<script lang="ts" setup>
import { onBeforeUpdate } from 'vue'
import { handleMousePressing } from '../../utils/helper'

const { value, valueKey, direction = 'vertical', disabled } = defineProps<{
  value: any[],
  valueKey?: string | ((value: any) => any) | undefined,
  direction?: 'vertical' | 'horizontal',
  disabled?: boolean,
}>()

defineSlots<{
  default?: (props: { value: any, index: number }) => any,
}>()

const emit = defineEmits<{
  (event: 'move', fromIndex: number): void,
  (event: 'stop', fromIndex: number): void,
  (event: 'change', fromIndex: number, toIndex: number): void,
}>()

const root = $ref<HTMLElement>()
let items = $ref<HTMLElement[]>([])
let draggingIndex = $ref(-1)

const keys = $computed(() => {
  return value.map((item, index) => {
    if (valueKey === undefined) return index
    if (typeof valueKey === 'function') return valueKey(item)
    return item[valueKey]
  })
})

let startingBounds = $ref<DOMRect>()
let startingEvent = $ref<MouseEvent>()
let startingParentBounds = $ref<DOMRect>()

const draggingElement = $computed(() => {
  return items[draggingIndex]
})

function startDragging(event: DragEvent, index: number) {
  if (items[index].contains(document.activeElement)) return
  emit('move', index)
  if (disabled) return
  handleMousePressing({
    onMove: handleDraggingMove,
    onEnd: handleDraggingEnd,
  })
  draggingIndex = index
  startingBounds = draggingElement.getBoundingClientRect()
  startingEvent = event
  startingParentBounds = root!.getBoundingClientRect()
}

function getMovingTarget(event: MouseEvent) {
  const min = direction === 'horizontal'
    ? startingParentBounds!.left - startingBounds!.left
    : startingParentBounds!.top - startingBounds!.top
  const max = direction === 'horizontal'
    ? startingParentBounds!.right - startingBounds!.right
    : startingParentBounds!.bottom - startingBounds!.bottom
  let distance = direction === 'horizontal'
    ? event.clientX - startingEvent!.clientX
    : event.clientY - startingEvent!.clientY
  distance = Math.max(Math.min(max, distance), min)
  const bounds = draggingElement.getBoundingClientRect()
  let offset = distance + (
    direction === 'horizontal'
      ? startingBounds!.left - bounds.left
      : startingBounds!.top - bounds.top
  )
  let currentIndex = items.findIndex(child => {
    const childBounds = child.getBoundingClientRect()
    return direction === 'horizontal'
      ? childBounds.right > event.clientX
      : childBounds.bottom > event.clientY
  })
  if (currentIndex === -1) {
    currentIndex = offset > 0 ? items.length - 1 : 0
  }
  return {
    offset,
    index: currentIndex,
    target: items[currentIndex],
  }
}

function resetDraggingElement() {
  if (draggingIndex === -1) return
  const { style } = draggingElement
  style.transform = ''
  style.order = String(2 * draggingIndex)
}

function handleDraggingMove(event: MouseEvent) {
  if (draggingIndex === -1) return
  resetDraggingElement()
  if (event.defaultPrevented) return
  const { style } = draggingElement
  let { offset, index, target } = getMovingTarget(event)
  if (index !== draggingIndex) {
    const currentBounds = target.getBoundingClientRect()
    style.order = String(index * 2 + (offset > 0 ? 1 : -1))
    offset -= (
      direction === 'horizontal'
        ? currentBounds.left - startingBounds!.left
        : currentBounds.top - startingBounds!.top
    )
  }
  style.transform = `translate${direction === 'horizontal' ? 'X' : 'Y'}(${offset}px)`
}

function handleDraggingEnd(event: MouseEvent) {
  if (draggingIndex === -1) return
  resetDraggingElement()
  const { index } = getMovingTarget(event)
  if (!event.defaultPrevented && index !== draggingIndex) {
    emit('change', draggingIndex, index)
  } else {
    emit('stop', draggingIndex)
  }
  draggingIndex = index
  setTimeout(() => {
    draggingIndex = -1
  })
}

onBeforeUpdate(() => {
  items = []
})
</script>

<template>
  <div ref="root" :class="['sortable-list', direction]">
    <div
      v-for="(item, index) in value"
      :key="keys[index]"
      :ref="(el: HTMLDivElement) => items[index] = el"
      draggable="true"
      :class="['sortable-item', { dragging: draggingIndex === index }]"
      :style="{ order: index * 2 }"
      @dragstart.prevent="startDragging($event, index)"
    >
      <slot :value="item" :index="index"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sortable-list {
  display: flex;
  flex-direction: column;
}
.sortable-item {
  &.dragging {
    position: relative;
    z-index: 3;
    cursor: move;
  }
  &:not(.dragging) {
    transition: transform 0.2s;
  }
}
</style>
