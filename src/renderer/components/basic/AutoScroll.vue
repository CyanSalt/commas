<script lang="ts" setup>
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import type { ComponentPublicInstance } from 'vue'
import { watchEffect } from 'vue'

const {
  disabled,
} = defineProps<{
  disabled?: boolean,
}>()

let element = $ref<HTMLElement | null>()

watchEffect(onInvalidate => {
  if (!element) return
  onInvalidate(autoScrollForElements({
    element,
    canScroll: () => !disabled,
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
