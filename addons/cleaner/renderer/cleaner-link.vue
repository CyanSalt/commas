<template>
  <div class="form-line">
    <span class="link cleaner-link" @click="clear">
      <span v-i18n>Clear Cache#!cache.1</span>
    </span>
    <span class="cache-size" @click="check">{{ size }}</span>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { computed, onMounted, ref, unref } from 'vue'

export default {
  name: 'cleaner-link',
  setup() {
    const cacheSizeRef = ref()

    const sizeRef = computed(() => {
      let cacheSize = unref(cacheSizeRef)
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
      cacheSizeRef.value = await ipcRenderer.invoke('get-cache-size')
    }

    async function clear() {
      await ipcRenderer.invoke('clear-cache')
      check()
    }

    onMounted(() => {
      check()
    })

    return {
      size: sizeRef,
      check,
      clear,
    }
  },
}
</script>

<style lang="scss" scoped>
.cache-size {
  margin-left: 1em;
}
</style>
