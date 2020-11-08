<template>
  <div ref="root" class="sortable-list">
    <div
      v-for="(item, index) in value"
      :key="index"
      :ref="el => items[index] = el"
      :class="['sortable-item', { dragging: draggingIndex === index }]"
      :style="{ order: index * 2 }"
      @mousedown="startPressing($event, index)"
      @click.capture="click"
    >
      <slot :value="item" :index="index"></slot>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, ref, computed, unref, onBeforeUpdate } from 'vue'
import { handleMousePressing, createTimeout } from '../../utils/helper.mjs'

export default {
  name: 'SortableList',
  props: {
    value: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /**
     * @param {number} fromIndex
     * @param {number} toIndex
     */
    change: (fromIndex, toIndex) => {
      return Number.isInteger(fromIndex)
        && Number.isInteger(toIndex)
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      root: null,
      items: [],
      draggingIndex: -1,
    })

    function startPressing(startingEvent, index) {
      if (props.disabled) return
      let cancelPressing
      const cancelTimeout = createTimeout(() => {
        cancelPressing()
        startDragging(startingEvent, index)
      }, 500)
      cancelPressing = handleMousePressing({
        onEnd: cancelTimeout,
      })
    }

    const startingBoundsRef = ref(null)
    const startingEventRef = ref(null)
    const startingParentBoundsRef = ref(null)

    const draggingElementRef = computed(() => {
      return state.items[state.draggingIndex]
    })

    function startDragging(event, index) {
      handleMousePressing({
        onMove: handleDraggingMove,
        onEnd: handleDraggingEnd,
      })
      state.draggingIndex = index
      const draggingElement = unref(draggingElementRef)
      startingBoundsRef.value = draggingElement.getBoundingClientRect()
      startingEventRef.value = event
      startingParentBoundsRef.value = state.root.getBoundingClientRect()
    }

    function getMovingTarget(event) {
      const draggingElement = unref(draggingElementRef)
      const startingParentBounds = unref(startingParentBoundsRef)
      const startingBounds = unref(startingBoundsRef)
      const startingEvent = unref(startingEventRef)
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

    function handleDraggingMove(event) {
      const draggingIndex = state.draggingIndex
      if (draggingIndex === -1) return
      const { style } = unref(draggingElementRef)
      style.transform = ''
      style.order = 2 * draggingIndex
      let { offset, index, target } = getMovingTarget(event)
      if (index !== draggingIndex) {
        const currentBounds = target.getBoundingClientRect()
        style.order = index * 2 + (offset > 0 ? 1 : -1)
        const startingBounds = unref(startingBoundsRef)
        offset -= currentBounds.top - startingBounds.top
      }
      style.transform = `translateY(${offset}px)`
    }

    function handleDraggingEnd(event) {
      const draggingIndex = state.draggingIndex
      if (draggingIndex === -1) return
      const { style } = unref(draggingElementRef)
      style.transform = ''
      style.order = 2 * draggingIndex
      const { index } = getMovingTarget(event)
      if (index !== draggingIndex) {
        emit('change', draggingIndex, index)
      }
      state.draggingIndex = index
      setTimeout(() => {
        state.draggingIndex = -1
      })
    }

    function click(event) {
      if (state.draggingIndex !== -1) {
        event.stopPropagation()
      }
    }

    onBeforeUpdate(() => {
      state.items = []
    })

    return {
      ...toRefs(state),
      startPressing,
      click,
    }
  },
}
</script>

<style>
.sortable-list {
  display: flex;
  flex-direction: column;
}
.sortable-list .sortable-item.dragging {
  position: relative;
  z-index: 3;
  cursor: move;
}
.sortable-list .sortable-item:not(.dragging) {
  transition: transform 0.2s;
}
</style>
