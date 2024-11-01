<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'

defineOptions({
  inheritAttrs: false,
})

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
  const { startedAt, data } = terminal.addons.recorder.save()
  commas.context.invoke('toggle-recorder', terminal, false)
  const date = new Date(startedAt)
  await ipcRenderer.invoke('save-file', commas.remote.translate('Terminal Recording ${date}#!camera.1', {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}.${String(date.getSeconds()).padStart(2, '0')}`,
  }) + '.ttyrec', data)
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
</script>

<template>
  <div
    v-if="isTeletype"
    v-bind="$attrs"
    :class="['recorder-anchor', { active: isCapturing }]"
    @click="capture"
  >
    <VisualIcon name="lucide-video" class="recorder-icon" />
  </div>
</template>

<style lang="scss" scoped>
.recorder-anchor {
  &.active {
    color: rgb(var(--system-red));
  }
}
.recorder-icon {
  .recorder-anchor.active & {
    fill: currentColor;
  }
}
</style>
