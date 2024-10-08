<script lang="ts" setup>
import { nativeImage, shell } from 'electron'
import { watchEffect } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from '../../api/core-renderer'
import { omitHome } from '../../shared/terminal'
import { useSettings } from '../compositions/settings'
import { useCurrentTerminal } from '../compositions/terminal'
import { translate, vI18n } from '../utils/i18n'
import { getPrompt } from '../utils/terminal'
import VisualIcon from './basic/VisualIcon.vue'

const settings = useSettings()
const terminal = $(useCurrentTerminal())

const anchors = commas.proxy.context.getCollection('terminal.ui-title-anchor')

let iconBuffer = $ref<Buffer>()

const isEnabled = $computed(() => {
  return settings['terminal.view.frameType'] === 'immersive'
})

const isDirectory = $computed(() => {
  if (!terminal) return false
  if (terminal.pane && terminal.shell) {
    return terminal.shell === terminal.cwd
  }
  return true
})

const fileOrDirectory = $computed(() => {
  if (!terminal) return ''
  if (terminal.pane && terminal.shell) return terminal.shell
  return terminal.cwd
})

const pane = $computed(() => {
  if (!terminal) return null
  return terminal.pane
})

const title = $computed(() => {
  if (!terminal) return ''
  if (fileOrDirectory) return omitHome(fileOrDirectory)
  if (terminal.title) return terminal.title
  const expr = settings['terminal.tab.titleFormat']
  return getPrompt(expr, terminal)
})

let defaultIconBuffer: Buffer | undefined
if (process.platform === 'darwin') {
  defaultIconBuffer = nativeImage.createFromNamedImage('NSImageNameFolder')
    .resize({ width: 32 })
    .toPNG()
}

async function updateIcon() {
  if (fileOrDirectory && process.platform === 'darwin' && settings['terminal.tab.liveIcon']) {
    iconBuffer = await ipcRenderer.invoke('get-icon', fileOrDirectory)
  } else {
    iconBuffer = defaultIconBuffer
  }
}

watchEffect(() => {
  if (!isEnabled) return
  iconBuffer = defaultIconBuffer
  updateIcon()
})

const icon = $computed(() => {
  if (iconBuffer) {
    const blob = new Blob([iconBuffer], { type: 'image/png' })
    return URL.createObjectURL(blob)
  } else {
    return ''
  }
})

function openDirectory(event: MouseEvent) {
  if (event.detail > 1) return
  if (isDirectory) {
    shell.openPath(fileOrDirectory)
  } else {
    shell.showItemInFolder(fileOrDirectory)
  }
}

function openFile() {
  shell.openPath(fileOrDirectory)
}

function startDraggingDirectory(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', fileOrDirectory)
  }
  ipcRenderer.invoke('drag-file', fileOrDirectory, iconBuffer)
}

watchEffect(() => {
  ipcRenderer.invoke('update-window', {
    title: `${pane && !fileOrDirectory ? translate(pane.title) : title}`,
    filename: fileOrDirectory,
  })
})
</script>

<template>
  <div class="terminal-title">
    <a
      v-if="fileOrDirectory"
      draggable="true"
      class="shortcut open-directory"
      @click="openDirectory"
      @dblclick.stop="openFile"
      @dragstart.prevent="startDraggingDirectory"
    >
      <img v-if="icon" class="directory-icon" :src="icon">
      <VisualIcon v-else :name="isDirectory ? 'lucide-folder' : 'lucide-file'" />
    </a>
    <div v-if="pane && !fileOrDirectory" v-i18n class="title-text">{{ pane.title }}</div>
    <div v-else class="title-text">{{ title }}</div>
    <component
      :is="anchor"
      v-for="(anchor, index) in anchors"
      :key="index"
      class="anchor"
    />
  </div>
</template>

<style lang="scss" scoped>
.terminal-title {
  display: flex;
  flex: 1;
  gap: 8px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  min-width: 0;
}
.shortcut {
  flex: none;
  transition: color 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
}
.open-directory:hover {
  color: rgb(var(--system-blue));
}
.directory-icon {
  width: 16px;
  vertical-align: -3.5px;
  transition: opacity 0.2s;
  .open-directory:active & {
    opacity: 0.5;
  }
}
.title-text {
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
:deep(.anchor) {
  display: inline-flex;
  font-size: 12px;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
</style>
