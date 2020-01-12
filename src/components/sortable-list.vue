<template>
  <div class="sortable-list">
    <div v-for="(item, index) in value" :key="index"
      :class="['sortable-item', {dragging: draggingIndex === index}]"
      :style="{order: index * 2}"
      @mousedown="start($event, index)" @click.capture="click">
      <slot :value="item" :index="index"></slot>
    </div>
  </div>
</template>

<script>
import {debounce} from 'lodash'

export default {
  name: 'SortableList',
  props: {
    value: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      draggingIndex: -1,
      draggingBounds: null,
      startEvent: null,
      startParentBounds: null,
    }
  },
  methods: {
    start(event, index) {
      window.addEventListener('mouseup', this.cancel)
      this.timer = setTimeout(() => {
        this.timer = null
        this.cancel()
        this.drag(event, index)
      }, 500)
    },
    drag(event, index) {
      window.addEventListener('mousemove', this.move, {passive: true})
      window.addEventListener('mouseup', this.end)
      this.draggingIndex = index
      const draggingEl = this.$el.children[this.draggingIndex]
      this.draggingBounds = draggingEl.getBoundingClientRect()
      this.startEvent = event
      this.startParentBounds = this.$el.getBoundingClientRect()
    },
    cancel() {
      window.removeEventListener('mouseup', this.cancel)
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    getMovingTarget(event) {
      const draggingEl = this.$el.children[this.draggingIndex]
      const min = this.startParentBounds.top - this.draggingBounds.top
      const max = this.startParentBounds.bottom - this.draggingBounds.bottom
      let distance = event.clientY - this.startEvent.clientY
      distance = Math.max(Math.min(max, distance), min)
      const bounds = draggingEl.getBoundingClientRect()
      let offset = distance + this.draggingBounds.top - bounds.top
      const children = [...this.$el.children]
      let currentIndex = children.findIndex(child => {
        const childBounds = child.getBoundingClientRect()
        return childBounds.bottom > event.clientY
      })
      if (currentIndex === -1) {
        currentIndex = offset > 0 ? children.length - 1 : 0
      }
      return {
        offset,
        index: currentIndex,
        target: children[currentIndex],
      }
    },
    move: debounce(function (event) {
      if (this.draggingIndex === -1) return
      const draggingEl = this.$el.children[this.draggingIndex]
      draggingEl.style.transform = ''
      draggingEl.style.order = 2 * this.draggingIndex
      let {offset, index, target} = this.getMovingTarget(event)
      if (index !== this.draggingIndex) {
        const currentBounds = target.getBoundingClientRect()
        draggingEl.style.order = index * 2 + (offset > 0 ? 1 : -1)
        offset -= currentBounds.top - this.draggingBounds.top
      }
      draggingEl.style.transform = `translateY(${offset}px)`
    }),
    end(event) {
      if (this.draggingIndex === -1) return
      window.removeEventListener('mousemove', this.move)
      window.removeEventListener('mouseup', this.end)
      const draggingEl = this.$el.children[this.draggingIndex]
      draggingEl.style.transform = ''
      draggingEl.style.order = 2 * this.draggingIndex
      const {index} = this.getMovingTarget(event)
      if (index !== this.draggingIndex) {
        this.$emit('change', this.draggingIndex, index)
      }
      this.draggingIndex = index
      setTimeout(() => {
        this.draggingIndex = -1
      })
    },
    click(event) {
      if (this.draggingIndex !== -1) event.stopPropagation()
    },
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
}
.sortable-list .sortable-item:not(.dragging) {
  transition: transform 0.2s;
}
</style>
