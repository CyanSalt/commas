<script lang="ts" setup>
import type { ThemeDefinition } from '../../../../src/typings/theme'

const { theme } = defineProps<{
  theme: ThemeDefinition,
}>()
</script>

<template>
  <div class="theme-card" :style="{ 'background-color': theme.background, color: theme.foreground }">
    <div class="theme-line"></div>
    <div class="theme-line" :style="{ color: theme.red }"></div>
    <div class="theme-line" :style="{ color: theme.green }"></div>
    <div class="theme-line" :style="{ color: theme.yellow }"></div>
    <div class="theme-line" :style="{ color: theme.blue }"></div>
    <div class="theme-line" :style="{ color: theme.magenta ?? theme.purple }"></div>
    <div class="theme-line" :style="{ color: theme.cyan }"></div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

.theme-card {
  padding: 1em;
}
.theme-line {
  height: 0.5em;
  background: currentColor;
  border-radius: 2px;
  @for $i from 1 through 7 {
    &:nth-child(#{$i}) {
      width: #{math.abs(math.sin($i)) * 100} + '%';
    }
  }
  & + & {
    margin-top: 0.5em;
  }
}
</style>
