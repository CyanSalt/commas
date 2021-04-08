<template>
  <div ref="root" class="sortable-list">
    <div
      v-for="(item, index) in value"
      :key="keys[index]"
      :ref="el => items[index] = el"
      draggable="true"
      :class="['sortable-item', { dragging: draggingIndex === index }]"
      :style="{ order: index * 2 }"
      @dragstart.prevent="startDragging($event, index)"
    >
      <slot :value="item" :index="index"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { reactive, toRefs, ref, computed, unref, onBeforeUpdate } from 'vue'
import { handleMousePressing } from '../../utils/helper'

export default {
  name: 'sortable-list',
  props: {
    value: {
      type: Array as PropType<any[]>,
      required: true,
    },
    valueKey: {
      type: [String, Function] as PropType<string | ((value: any) => any) | undefined>,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    change: (fromIndex: number, toIndex: number) => {
      return Number.isInteger(fromIndex)
        && Number.isInteger(toIndex)
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      root: null as HTMLElement | null,
      items: [] as HTMLElement[],
      draggingIndex: -1,
    })

    const keysRef = computed(() => {
      return props.value.map((value, index) => {
        if (props.valueKey === undefined) return index
        if (typeof props.valueKey === 'function') return props.valueKey.call(undefined, value)
        return value[props.valueKey]
      })
    })

    const startingBoundsRef = ref<DOMRect | null>(null)
    const startingEventRef = ref<MouseEvent | null>(null)
    const startingParentBoundsRef = ref<DOMRect | null>(null)

    const draggingElementRef = computed(() => {
      return state.items[state.draggingIndex]
    })

    function startDragging(event: DragEvent, index: number) {
      if (props.disabled || state.items[index].contains(document.activeElement)) return
      handleMousePressing({
        onMove: handleDraggingMove,
        onEnd: handleDraggingEnd,
      })
      state.draggingIndex = index
      const draggingElement = unref(draggingElementRef)
      startingBoundsRef.value = draggingElement.getBoundingClientRect()
      startingEventRef.value = event
      startingParentBoundsRef.value = (state.root as HTMLElement).getBoundingClientRect()
    }

    function getMovingTarget(event: MouseEvent) {
      const draggingElement = unref(draggingElementRef)
      const startingParentBounds = unref(startingParentBoundsRef)!
      const startingBounds = unref(startingBoundsRef)!
      const startingEvent = unref(startingEventRef)!
      const min = startingParentBounds.top - startingBounds.top
      const max = startingParentBounds.bottom - startingBounds.bottom
      let distance = event.clientY - startingEvent.clientY
      distance = Math.max(Math.min(max, distance), min)
      const bounds = draggingElement.getBoundingClientRect()
      let offset = distance + startingBounds.top - bounds.top
      const items = state.items
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
      const draggingIndex = state.draggingIndex
      if (draggingIndex === -1) return
      const { style } = unref(draggingElementRef)
      style.transform = ''
      style.order = String(2 * draggingIndex)
      let { offset, index, target } = getMovingTarget(event)
      if (index !== draggingIndex) {
        const currentBounds = target.getBoundingClientRect()
        style.order = String(index * 2 + (offset > 0 ? 1 : -1))
        const startingBounds = unref(startingBoundsRef)!
        offset -= currentBounds.top - startingBounds.top
      }
      style.transform = `translateY(${offset}px)`
    }

    function handleDraggingEnd(event: MouseEvent) {
      const draggingIndex = state.draggingIndex
      if (draggingIndex === -1) return
      const { style } = unref(draggingElementRef)
      style.transform = ''
      style.order = String(2 * draggingIndex)
      const { index } = getMovingTarget(event)
      if (index !== draggingIndex) {
        emit('change', draggingIndex, index)
      }
      state.draggingIndex = index
      setTimeout(() => {
        state.draggingIndex = -1
      })
    }

    onBeforeUpdate(() => {
      state.items = []
    })

    return {
      ...toRefs(state),
      keys: keysRef,
      startDragging,
    }
  },
}
</script>

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
