<script lang="ts" setup>
import FireworkOverlay from './FireworkOverlay.vue'
import { removeFirework, useBadge, useFireworks } from './badge'

const badge = useBadge()
const fireworks = useFireworks()
</script>

<template>
  <div class="badge-slot">
    <div v-if="badge" class="badge">{{ badge }}</div>
    <FireworkOverlay
      v-for="item in fireworks"
      :key="item.id"
      :position="item.position"
      @animation-end="removeFirework(item)"
    />
  </div>
</template>

<style lang="scss" scoped>
.badge-slot {
  position: fixed;
  z-index: 1;
  pointer-events: none;
}
.badge {
  position: fixed;
  top: 76px;
  right: 8px;
  color: rgb(var(--theme-red) / 0.5);
  font-weight: bold;
  font-size: 48px;
  -webkit-text-stroke: 1px rgb(var(--theme-background));
}
</style>
