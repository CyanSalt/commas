<template>
  <div class="landscape-anchor" @click="refresh">
    <span class="feather-icon icon-shuffle"></span>
  </div>
</template>

<script lang="ts">
import { refreshLandscapeBackground } from './hooks'

export default {
  name: 'landscape-anchor',
  setup() {
    return {
      refresh: refreshLandscapeBackground,
    }
  },
}
</script>

<style>
.proxy-anchor.active {
  color: var(--design-cyan);
}
</style>
