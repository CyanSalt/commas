<script lang="ts" setup>
import type { RemoteTheme } from './utils'

const { theme } = defineProps<{
  theme: RemoteTheme,
}>()
</script>

<template>
  <div class="theme-card" :style="{ 'background-color': theme.background, color: theme.foreground }">
    <div class="theme-line"></div>
    <div class="theme-line" :style="{ color: theme.brightRed }">
      <div class="theme-line" :style="{ color: theme.red }"></div>
    </div>
    <div class="theme-line" :style="{ color: theme.brightGreen }">
      <div class="theme-line" :style="{ color: theme.green }"></div>
    </div>
    <div class="theme-line" :style="{ color: theme.brightYellow }">
      <div class="theme-line" :style="{ color: theme.yellow }"></div>
    </div>
    <div class="theme-line" :style="{ color: theme.brightBlue }">
      <div class="theme-line" :style="{ color: theme.blue }"></div>
    </div>
    <div class="theme-line" :style="{ color: theme.brightMagenta ?? theme.brightPurple }">
      <div class="theme-line" :style="{ color: theme.magenta ?? theme.purple }"></div>
    </div>
    <div class="theme-line" :style="{ color: theme.brightCyan }">
      <div class="theme-line" :style="{ color: theme.cyan }"></div>
    </div>
    <div class="theme-line" :style="{ color: theme.meta.isDark ? theme.white : theme.black }">
      <div class="theme-line" :style="{ color: theme.meta.isDark ? theme.brightWhite : theme.brightBlack }"></div>
    </div>
    <!-- Invert brightWhite and white for light themes -->
    <div class="theme-line" :style="{ color: theme.meta.isDark ? theme.black : theme.brightWhite }">
      <div class="theme-line" :style="{ color: theme.meta.isDark ? theme.brightBlack : theme.white }"></div>
    </div>
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
    .theme-card > &:nth-child(#{$i}) {
      width: #{math.abs(math.sin($i)) * 100} + '%';
    }
  }
  & + & {
    margin-top: 0.5em;
  }
  & > & {
    width: 80%;
  }
}
</style>
