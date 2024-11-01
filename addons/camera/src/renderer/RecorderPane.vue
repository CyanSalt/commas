<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import { useTimestamp } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import { onMounted, watchEffect } from 'vue'
import { useTTYRecFrames } from './compositions'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock, VisualIcon } = commas.ui.vueAssets

const file = $computed(() => tab.shell)

function openEditingMenu(event: MouseEvent) {
  const { definitionItems, editingItems } = commas.ui.createContextMenu()
  commas.ui.openContextMenu([
    ...commas.ui.withContextMenuSeparator(definitionItems, []),
    ...editingItems,
  ], event)
}

const element = $ref<HTMLElement>()

const xterm = commas.workspace.useReadonlyTerminal(() => tab, $$(element))

const frames = $(useTTYRecFrames($$(file)))

const isFinished = $computed(() => {
  return frames.length ? frames[frames.length - 1].offset === -1 : false
})

const actualFrames = $computed(() => {
  return isFinished ? frames.slice(0, -1) : frames
})

let {
  timestamp,
  isActive,
  pause,
  resume,
} = $(useTimestamp({
  controls: true,
  immediate: false,
}))

let start = $ref<number>()

let currentTime = $computed({
  get: () => {
    return typeof start === 'number' ? timestamp - start : 0
  },
  set: value => {
    if (value < 0) {
      start = undefined
    } else {
      start = timestamp - value
    }
  },
})

function play() {
  const timeBefore = currentTime
  timestamp = Date.now()
  currentTime = timeBefore
  resume()
}

const duration = $computed(() => {
  if (!actualFrames.length) return 0
  return actualFrames[actualFrames.length - 1].offset
})

let lastFrameIndex = $ref(-1)

const isEnded = $computed(() => {
  return lastFrameIndex === actualFrames.length - 1
})

watchEffect(() => {
  const lastRenderingFrameIndex = actualFrames.findLastIndex(item => currentTime >= item.offset)
  let firstRenderingFrameIndex: number
  if (lastFrameIndex > lastRenderingFrameIndex) {
    xterm.clear()
    firstRenderingFrameIndex = 0
  } else {
    firstRenderingFrameIndex = lastFrameIndex + 1
  }
  for (let index = firstRenderingFrameIndex; index < lastRenderingFrameIndex + 1; index += 1) {
    const item = actualFrames[index]
    xterm.write(item.data)
  }
  lastFrameIndex = lastRenderingFrameIndex
})

watchEffect(onInvalidate => {
  if (isEnded) {
    pause()
    if (isFinished) {
      currentTime = duration as number
    } else {
      onInvalidate(() => {
        play()
      })
    }
  }
})

function playOrPause() {
  if (isActive) {
    pause()
  } else {
    play()
  }
}

const durationFormat = new Intl.DurationFormat(undefined, {
  style: 'digital',
  hoursDisplay: 'auto',
})

function formatTime(time: number) {
  const seconds = Math.round(time / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return durationFormat.format({
    hours,
    minutes: minutes % 60,
    seconds: seconds % 60,
  })
}

onMounted(() => {
  currentTime = 0
  lastFrameIndex = -1
  play()
})
</script>

<template>
  <TerminalBlock :tab="tab" class="recorder-pane" @contextmenu="openEditingMenu">
    <div class="recorder-control">
      <button class="action" @click="playOrPause">
        <VisualIcon :name="isActive ? 'lucide-pause' : 'lucide-play'" class="play-icon" />
      </button>
      <span class="time-indicator">{{ formatTime(currentTime) }}</span>
      <input v-model="currentTime" type="range" :max="duration" class="progress">
      <span class="time-indicator">{{ formatTime(duration) }}</span>
    </div>
    <div ref="element" class="terminal-content"></div>
  </TerminalBlock>
</template>

<style lang="scss" scoped>
@use 'sass:math';
@use '@commas/api/scss/_partials';

.recorder-pane {
  :deep(.terminal-container) {
    display: flex;
    flex-direction: column;
  }
}
.terminal-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.recorder-control {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px 0 8px;
  font-size: 12px;
}
.action {
  appearance: none;
  padding: 4px;
  border: none;
  font-size: 14px;
  background: transparent;
  border-radius: 4px;
  transition: opacity 0.2s, transform 0.2s;
  cursor: pointer;
  &:hover {
    background: var(--design-highlight-background);
  }
  &:active {
    transform: scale(partials.nano-scale(22));
  }
}
.play-icon {
  fill: currentColor !important;
}
.progress {
  appearance: none;
  flex: 1;
  min-width: 0;
  margin: 0;
  background: transparent;
  &::-webkit-slider-thumb {
    appearance: none;
    width: 4px;
    height: 16px;
    margin-top: #{math.div(4px - 16px, 2)};
    color: rgb(var(--system-accent));
    background: currentColor;
    border-radius: 4px;
  }
  &::-webkit-slider-runnable-track {
    height: 4px;
    background: var(--design-input-background);
    border-radius: 4px;
  }
}
</style>
