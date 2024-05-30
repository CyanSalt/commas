<script lang="ts" setup>
const { vertical } = defineProps<{
  vertical?: boolean,
}>()
</script>

<template>
  <div :class="['drop-indicator', { vertical }]"></div>
</template>

<style lang="scss" scoped>
.drop-indicator {
  height: 0;
  outline: 1px solid rgb(var(--system-accent));
  &.vertical {
    width: 0;
    height: auto;
  }
}
</style>
