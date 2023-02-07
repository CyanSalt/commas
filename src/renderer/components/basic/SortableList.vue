<script lang="ts" setup>
import { onBeforeUpdate } from 'vue'
import { handleMousePressing } from '../../utils/helper'

const { value, valueKey, disabled } = defineProps<{
  value: any[],
  valueKey?: string | ((value: any) => any) | undefined,
  disabled?: boolean,
}>()

const emit = defineEmits<{
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
  if (disabled) return
  if (items[index].contains(document.activeElement)) return
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
  const min = startingParentBounds!.top - startingBounds!.top
  const max = startingParentBounds!.bottom - startingBounds!.bottom
  let distance = event.clientY - startingEvent!.clientY
  distance = Math.max(Math.min(max, distance), min)
  const bounds = draggingElement.getBoundingClientRect()
  let offset = distance + startingBounds!.top - bounds.top
  let currentIndex = items.findIndex(child => {
    const childBounds = child.getBoundingClientRect()
    return childBounds.bottom > event.clientY
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

function handleDraggingMove(event: MouseEvent) {
  if (draggingIndex === -1) return
  const { style } = draggingElement
  style.transform = ''
  style.order = String(2 * draggingIndex)
  let { offset, index, target } = getMovingTarget(event)
  if (index !== draggingIndex) {
    const currentBounds = target.getBoundingClientRect()
    style.order = String(index * 2 + (offset > 0 ? 1 : -1))
    offset -= currentBounds.top - startingBounds!.top
  }
  style.transform = `translateY(${offset}px)`
}

function handleDraggingEnd(event: MouseEvent) {
  if (draggingIndex === -1) return
  const { style } = draggingElement
  style.transform = ''
  style.order = String(2 * draggingIndex)
  const { index } = getMovingTarget(event)
  if (index !== draggingIndex) {
    emit('change', draggingIndex, index)
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
  <div ref="root" class="sortable-list">
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
