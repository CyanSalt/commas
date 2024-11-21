<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import { refAutoReset } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import { clipboard } from 'electron'
import { watchEffect } from 'vue'

const { VisualIcon } = commas.ui.vueAssets

const terminal = $(commas.workspace.useCurrentTerminal())

const isTeletype = $computed(() => {
  return Boolean(terminal && !terminal.pane)
})

function startCapturing() {
  if (!terminal) return
  commas.context.invoke('toggle-recorder', terminal, true)
}

async function stopCapturing() {
  if (!terminal) return
  if (!terminal.addons.recorder) return
  const channel = terminal.addons.recorder.getChannel()
  if (!channel) return
  const file = await ipcRenderer.invoke('ttyrec-write-finish', channel)
  commas.remote.addFile(file)
  commas.context.invoke('toggle-recorder', terminal, false)
}

const isCapturing = $computed(() => {
  return Boolean(terminal?.addons?.recorder)
})

watchEffect(() => {
  const tab = terminal
  if (!tab) return
  if (!isTeletype) return
  if (isCapturing) {
    tab.alerting = true
  } else {
    delete tab.alerting
  }
})

function capture() {
  if (!isCapturing) {
    startCapturing()
  } else {
    stopCapturing()
  }
}

let feedbacking = $(refAutoReset(false, 1000))

async function share() {
  if (!terminal) return
  const channel = terminal.addons.recorder.getChannel()
  if (!channel) return
  const url = await ipcRenderer.invoke('ttyrec-share', channel)
  clipboard.writeText(url)
  feedbacking = true
}
</script>

<template>
  <template v-if="isTeletype">
    <button
      v-if="isCapturing"
      type="button"
      data-commas
      class="recorder-share-anchor"
      @click="share"
    >
      <VisualIcon v-if="feedbacking" name="lucide-clipboard-check" />
      <VisualIcon v-else name="lucide-share-2" />
    </button>
    <button
      type="button"
      data-commas
      :class="['recorder-anchor', { active: isCapturing }]"
      @click="capture"
    >
      <VisualIcon name="lucide-video" class="recorder-icon" />
    </button>
  </template>
</template>

<style lang="scss" scoped>
.recorder-anchor {
  &.active {
    color: rgb(var(--system-red));
    opacity: 1;
  }
}
.recorder-icon {
  .recorder-anchor.active & {
    fill: currentColor;
  }
}
</style>
