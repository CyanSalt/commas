<template>
  <div class="landscape-anchor" @click="refresh">
    <span class="feather-icon icon-shuffle"></span>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { refreshLandscapeBackground } from './hooks.mjs'

export default {
  name: 'landscape-anchor',
  setup() {
    const state = reactive({})

    return {
      ...toRefs(state),
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
