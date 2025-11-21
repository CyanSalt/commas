<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core'
import { onUnmounted, useTemplateRef, watch, watchEffect } from 'vue'
import { RendererWebContentsView } from '../composables/web-contents'

let url = $(defineModel<string>())

const emit = defineEmits<{
  (event: 'initialize', view: RendererWebContentsView): void,
}>()

let root = $(useTemplateRef<HTMLDivElement>('root'))
let view = $ref<RendererWebContentsView>()

watch($$(root), async element => {
  if (!element) return
  view = await RendererWebContentsView.create(element)
  emit('initialize', view)
}, { immediate: true })

onUnmounted(async () => {
  if (!view) return
  view.destroy()
})

useResizeObserver($$(root), async () => {
  if (!view) return
  view.resize(root!)
})

watch(() => view?.url, value => {
  if (value) {
    url = value
  }
}, { immediate: true })

watchEffect(() => {
  if (!url || !view) return
  if (url !== view.url) {
    view.navigate(url)
  }
})
</script>

<template>
  <div ref="root" class="web-contents"></div>
</template>

<style lang="scss" scoped>
.web-contents {
  border-radius: var(--design-card-border-radius);
  -electron-corner-smoothing: 60%;
}
</style>
