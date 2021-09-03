<template>
  <div v-show="isOverflowed" ref="root" :class="['scroll-bar', { 'is-scrolling': isScrolling }]">
    <div class="scroll-track" @click.self="jump"></div>
    <div
      draggable="true"
      class="scroll-thumb"
      :style="thumbStyle"
      @dragstart.prevent="startScrolling"
    ></div>
  </div>
</template>

<script lang="ts">
import { computed, onActivated, onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { handleMousePressing } from '../../utils/helper'

export default {
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
    const rootRef = ref<HTMLElement | null>(null)
    const isScrollingRef = ref(false)

    const heightRef = ref(0)
    const maxHeightRef = ref(0)
    const topRef = ref(0)

    const isOverflowedRef = computed(() => {
      const height = unref(heightRef)
      if (!height) return false
      return height !== unref(maxHeightRef)
    })

    const thumbStyleRef = computed<Partial<CSSStyleDeclaration>>(() => {
      return {
        height: unref(heightRef) + 'px',
        top: unref(topRef) + 'px',
      }
    })

    const containerRef = computed(() => {
      if (props.parent) return props.parent
      const root = unref(rootRef)
      if (root) return root.previousElementSibling
      return null
    })

    function getIntersectionRatio() {
      const container = unref(containerRef)!
      const maxHeight = unref(maxHeightRef)
      return maxHeight / container.scrollHeight
    }

    function scrollTo(position: number) {
      const container = unref(containerRef)
      if (!container) return
      position = Math.min(Math.max(position, 0), container.scrollHeight)
      const ratio = getIntersectionRatio()
      container.scrollTop = Math.round(position / ratio)
    }

    function jump(event: MouseEvent) {
      requestAnimationFrame(() => {
        const height = unref(heightRef)
        scrollTo(event.offsetY - (height / 2))
      })
    }

    function startScrolling(startingEvent: DragEvent) {
      isScrollingRef.value = true
      const startingTop = unref(topRef)
      handleMousePressing({
        onMove(event) {
          requestAnimationFrame(() => {
            scrollTo(startingTop + event.clientY - startingEvent.clientY)
          })
        },
        onEnd() {
          isScrollingRef.value = false
        },
      })
    }

    function syncScrolling() {
      const container = unref(containerRef)
      if (!container) return
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
      const root = unref(rootRef)!
      maxHeightRef.value = root.parentElement!.clientHeight
      const container = unref(containerRef)!
      container.addEventListener('scroll', handleScroll, { passive: true })
    })

    onBeforeUnmount(() => {
      const container = unref(containerRef)
      container?.removeEventListener('scroll', handleScroll)
    })

    onActivated(() => {
      if (props.keepAlive) {
        const top = unref(topRef)
        scrollTo(top)
      }
    })

    return {
      root: rootRef,
      isScrolling: isScrollingRef,
      isOverflowed: isOverflowedRef,
      thumbStyle: thumbStyleRef,
      jump,
      startScrolling,
    }
  },
}
</script>

<style lang="scss" scoped>
.scroll-bar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  width: 16px;
}
.scroll-track,
.scroll-thumb {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--theme-foreground);
  opacity: 0;
  transition: opacity 0.5s;
}
.scroll-track {
  .scroll-bar:hover &,
  .scroll-bar.is-scrolling & {
    opacity: 0.1;
  }
}
.scroll-thumb {
  .scroll-bar:hover &,
  .scroll-bar.is-scrolling & {
    opacity: 0.2;
  }
}
</style>
