<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'
import { useTTYRecFrames } from './compositions'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets

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

function loop<T>(fn: (time: number, token: T, next: (value: T) => void) => void, token: T) {
  let id: ReturnType<typeof requestAnimationFrame>
  let timeOffset: number | undefined
  let next: (value: T) => void
  const iteratee = (time: number) => {
    if (typeof timeOffset !== 'number') {
      timeOffset = time
    }
    fn(time - timeOffset, token, next)
  }
  next = (value: T) => {
    token = value
    requestAnimationFrame(iteratee)
  }
  id = requestAnimationFrame(iteratee)
  return () => {
    cancelAnimationFrame(id)
  }
}

const frames = $(useTTYRecFrames($$(file)))

const isFinished = $computed(() => {
  return frames.length ? frames[frames.length - 1].offset === -1 : false
})

watchEffect(onInvalidate => {
  xterm.clear()
  // Reference
  let list = frames
  const cancel = loop((time, offset, next) => {
    for (let index = offset; index < list.length; index += 1) {
      const item = list[index]
      if (time >= item.offset) {
        xterm.write(item.data)
      } else {
        next(index)
        return
      }
    }
    if (!isFinished) {
      next(list.length)
    }
  }, 0)
  onInvalidate(cancel)
})
</script>

<template>
  <TerminalBlock :tab="tab" class="recorder-pane" @contextmenu="openEditingMenu">
    <div ref="element" class="terminal-content"></div>
  </TerminalBlock>
</template>

<style lang="scss" scoped>
.recorder-pane {
  :deep(.terminal-container) {
    display: flex;
  }
}
.terminal-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
</style>
