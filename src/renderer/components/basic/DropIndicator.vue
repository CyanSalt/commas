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
  &::before {
    content: '';
    position: absolute;
    display: block;
    width: 4px;
    height: 4px;
    border: 2px solid rgb(var(--system-accent));
    background: rgb(var(--theme-background));
    border-radius: 6px;
    -electron-corner-smoothing: 60%;
  }
  &.vertical::before {
    top: -2px;
    left: 50%;
    margin-left: -4px;
  }
  &:not(.vertical)::before {
    top: 50%;
    left: -2px;
    margin-top: -4px;
  }
}
</style>
