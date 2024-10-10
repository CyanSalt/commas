<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core'
import { onUnmounted, watch, watchEffect } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import { createWebContents, navigateWebContents, RendererWebContentsView, resizeWebContents } from '../compositions/web-contents'

let url = $(defineModel<string>())
let title = $(defineModel<string>('title'))
let icon = $(defineModel<string>('icon'))

let root = $ref<HTMLDivElement>()
let view = $ref<RendererWebContentsView>()

watch($$(root), async element => {
  if (!element) return
  view = await createWebContents(element)
}, { immediate: true })

onUnmounted(async () => {
  if (!view) return
  ipcRenderer.invoke('destroy-web-contents', view.id)
})

useResizeObserver($$(root), async () => {
  if (!view) return
  resizeWebContents(view.id, root!)
})

watchEffect(() => {
  title = view?.title
})
watchEffect(() => {
  icon = view?.icon
})

watch(() => view?.url, value => {
  if (value) {
    url = value
  }
}, { immediate: true })

watchEffect(() => {
  if (!url || !view) return
  if (url !== view.url) {
    navigateWebContents(view.id, url)
  }
})
</script>

<template>
  <div ref="root" class="web-contents"></div>
</template>
