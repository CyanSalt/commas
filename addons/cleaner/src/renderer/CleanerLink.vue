<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import { onMounted } from 'vue'

const { vI18n, VisualIcon } = commas.ui.vueAssets

let cacheSize = $ref<number>()

const size = $computed(() => {
  if (typeof cacheSize !== 'number') return 'N/A'
  const group = 1024
  let units = ['B', 'K', 'M', 'G', 'T']
  let currentIndex = 0
  while (cacheSize > group && currentIndex < units.length - 1) {
    cacheSize /= group
    currentIndex += 1
  }
  return `${Math.round(cacheSize * 100) / 100}${units[currentIndex]}`
})

async function check() {
  cacheSize = await ipcRenderer.invoke('get-cache-size')
}

async function clear() {
  await ipcRenderer.invoke('clear-cache')
  check()
}

onMounted(() => {
  check()
})
</script>

<template>
  <div class="form-line cleaner-link">
    <label v-i18n class="form-label">Cache#!cache.1</label>
    <span class="cache-size" @click="check">{{ size }}</span>
    <span class="link form-action" @click="clear">
      <VisualIcon name="lucide-paintbrush" />
    </span>
  </div>
</template>
