<script lang="ts" setup>
import FireworkOverlay from './firework-overlay.vue'
import { removeFirework, useFireworks } from './fireworks'

const fireworks = useFireworks()
</script>

<template>
  <div class="firework-slot">
    <FireworkOverlay
      v-for="item in fireworks"
      :key="item.id"
      :position="item.position"
      @animation-end="removeFirework(item)"
    />
  </div>
</template>

<style lang="scss" scoped>
.firework-slot {
  position: fixed;
  pointer-events: none;
}
</style>
