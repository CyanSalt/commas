<template>
  <div v-show="isOverflowed" ref="root" :class="['scroll-bar', { 'is-scrolling': isScrolling }]">
    <div class="scroll-track" @click.self="jump"></div>
    <div class="scroll-thumb" :style="thumbStyle" @mousedown="startScrolling"></div>
  </div>
</template>

<script>
import { reactive, toRefs, ref, computed, unref, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { handleMousePressing } from '../../utils/helper'

export default {
  name: 'ScrollBar',
  props: {
    parent: {
      type: HTMLElement,
      default: undefined,
    },
    keepAlive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const state = reactive({
      root: null,
      isScrolling: false,
    })

    const heightRef = ref(0)
    const maxHeightRef = ref(0)
    const topRef = ref(0)

    state.isOverflowed = computed(() => {
      const height = unref(heightRef)
      if (!height) return false
      return height !== unref(maxHeightRef)
    })

    state.thumbStyle = computed(() => {
      return {
        height: unref(heightRef) + 'px',
        top: unref(topRef) + 'px',
      }
    })

    const containerRef = computed(() => {
      if (props.parent) return props.parent
      if (state.root) return state.root.previousElementSibling
      return null
    })

    function getIntersectionRatio() {
      const container = unref(containerRef)
      const maxHeight = unref(maxHeightRef)
      return maxHeight / container.scrollHeight
    }

    function scrollTo(position) {
      const container = unref(containerRef)
      position = Math.min(Math.max(position, 0), container.scrollHeight)
      const ratio = getIntersectionRatio()
      container.scrollTop = Math.round(position / ratio)
    }

    function jump(event) {
      requestAnimationFrame(() => {
        const height = unref(heightRef)
        scrollTo(event.offsetY - (height / 2))
      })
    }

    function startScrolling(startingEvent) {
      state.scrolling = true
      const startingTop = unref(topRef)
      handleMousePressing({
        onMove(event) {
          requestAnimationFrame(() => {
            scrollTo(startingTop + event.clientY - startingEvent.clientY)
          })
        },
        onEnd(event) {
          state.scrolling = false
        },
      })
    }

    function syncScrolling() {
      const container = unref(containerRef)
      const ratio = getIntersectionRatio()
      heightRef.value = Math.round(container.clientHeight * ratio)
      topRef.value = Math.round(container.scrollTop * ratio)
    }

    function handleScroll() {
      requestAnimationFrame(() => {
        syncScrolling()
      })
    }

    onMounted(() => {
      maxHeightRef.value = state.root.parentElement.clientHeight
      const container = unref(containerRef)
      container.addEventListener('scroll', handleScroll, { passive: true })
    })

    onBeforeUnmount(() => {
      const container = unref(containerRef)
      container.removeEventListener('scroll', handleScroll)
    })

    onActivated(() => {
      if (props.keepAlive) {
        const top = unref(topRef)
        scrollTo(top)
      }
    })

    return {
      ...toRefs(state),
      jump,
      startScrolling,
    }
  },
}
</script>

<style>
.scroll-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 16px;
  z-index: 4;
}
.scroll-bar .scroll-track,
.scroll-bar .scroll-thumb {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  top: 0;
  background: var(--theme-foreground);
  opacity: 0;
  transition: opacity 0.5s;
}
.scroll-bar:hover .scroll-track,
.scroll-bar.is-scrolling .scroll-track {
  opacity: 0.1;
}
.scroll-bar:hover .scroll-thumb,
.scroll-bar.is-scrolling .scroll-thumb {
  opacity: 0.2;
}
</style>
