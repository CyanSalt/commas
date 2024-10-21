<script lang="ts" setup>
import { useBadge } from './badge'

const badge = useBadge()
</script>

<template>
  <div class="badge-slot">
    <div v-if="badge" class="badge">{{ badge }}</div>
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
  color: rgb(var(--theme-red) / 50%);
  font-weight: bold;
  font-size: 48px;
  text-align: right;
  -webkit-text-stroke: 1px rgb(var(--theme-background));
}
</style>
