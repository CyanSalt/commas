<script lang="ts" setup>
import type { RemoteTheme } from './utils'

const { theme } = defineProps<{
  theme?: RemoteTheme,
}>()
</script>

<template>
  <figure
    :class="['theme-card', { skeleton: !theme }]"
    :style="{ 'background-color': theme?.background, color: theme?.foreground }"
  >
    <figcaption class="card-header">
      <span class="theme-name">{{ theme?.name }}</span>
    </figcaption>
    <div class="theme-preview">
      <div class="preview-line" :style="{ color: theme?.brightRed }">
        <div class="preview-line" :style="{ color: theme?.red }"></div>
      </div>
      <div class="preview-line" :style="{ color: theme?.brightGreen }">
        <div class="preview-line" :style="{ color: theme?.green }"></div>
      </div>
      <div class="preview-line" :style="{ color: theme?.brightYellow }">
        <div class="preview-line" :style="{ color: theme?.yellow }"></div>
      </div>
      <div class="preview-line" :style="{ color: theme?.brightBlue }">
        <div class="preview-line" :style="{ color: theme?.blue }"></div>
      </div>
      <div class="preview-line" :style="{ color: theme?.brightMagenta ?? theme?.brightPurple }">
        <div class="preview-line" :style="{ color: theme?.magenta ?? theme?.purple }"></div>
      </div>
      <div class="preview-line" :style="{ color: theme?.brightCyan }">
        <div class="preview-line" :style="{ color: theme?.cyan }"></div>
      </div>
      <div class="preview-line" :style="{ color: theme?.meta.isDark ? theme.white : theme?.black }">
        <div class="preview-line" :style="{ color: theme?.meta.isDark ? theme.brightWhite : theme?.brightBlack }"></div>
      </div>
      <!-- Invert brightWhite and white for light themes -->
      <div class="preview-line" :style="{ color: theme?.meta.isDark ? theme.black : theme?.brightWhite }">
        <div class="preview-line" :style="{ color: theme?.meta.isDark ? theme.brightBlack : theme?.white }"></div>
      </div>
    </div>
  </figure>
</template>

<style lang="scss" scoped>
@use 'sass:math';

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

.theme-card {
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: hidden;
  background: var(--design-highlight-background);
  border-radius: 4px;
  box-shadow: var(--design-element-shadow);
}
.card-header {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0.5em 1em 0;
}
.theme-name {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  .theme-card.skeleton & {
    width: 8em;
    height: 1em;
    background: var(--design-input-background);
    animation: pulse 2s ease-in-out infinite;
  }
}
.theme-preview {
  padding: 0.5em 1em 1em;
}
.preview-line {
  height: 0.5em;
  color: transparent;
  background: currentColor;
  border-radius: 2px;
  @for $i from 1 through 7 {
    .theme-preview > &:nth-child(#{$i}) {
      width: #{math.abs(math.sin($i)) * 100} + '%';
    }
  }
  & + & {
    margin-top: 0.5em;
  }
  & > & {
    width: 80%;
  }
  .theme-card.skeleton &:has(&) {
    color: var(--design-input-background);
    animation: pulse 2s ease-in-out infinite;
  }
}
</style>
