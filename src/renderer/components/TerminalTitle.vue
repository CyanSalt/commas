<script lang="ts" setup>
import { ipcRenderer, nativeImage, shell } from 'electron'
import { watchEffect } from 'vue'
import { omitHome } from '../../shared/terminal'
import { useSettings } from '../compositions/settings'
import { useIsTabListEnabled } from '../compositions/shell'
import { showTabOptions, useCurrentTerminal, useTerminalActiveIndex, useTerminalTabs } from '../compositions/terminal'
import { translate, vI18n } from '../utils/i18n'
import { getPrompt } from '../utils/terminal'

const settings = useSettings()
const tabs = $(useTerminalTabs())
const activeIndex = $(useTerminalActiveIndex())
const terminal = $(useCurrentTerminal())

let isTabListEnabled = $(useIsTabListEnabled())

let iconBuffer = $ref<Buffer | undefined>()

const isEnabled: boolean = $computed(() => {
  return settings['terminal.view.frameType'] === 'immersive'
})

const isDirectory: boolean = $computed(() => {
  if (!terminal) return false
  if (terminal.pane && terminal.shell) return false
  return true
})

const fileOrDirectory: string = $computed(() => {
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

function toggleTabList() {
  isTabListEnabled = !isTabListEnabled
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
      <span v-else :class="['feather-icon', isDirectory ? 'icon-folder' : 'icon-file']"></span>
    </a>
    <div v-if="pane && !fileOrDirectory" v-i18n class="title-text">{{ pane.title }}</div>
    <div v-else class="title-text">{{ title }}</div>
    <div
      class="tab-index-indicator"
      @click="toggleTabList"
      @contextmenu="showTabOptions"
    >
      [{{ activeIndex + 1 }}/{{ tabs.length }}]
    </div>
  </div>
</template>

<style lang="scss" scoped>
.terminal-title {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0 8px;
  font-size: 12px;
}
.shortcut {
  flex: none;
  margin-right: 8px;
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
  /* Show ellipsis on left */
  direction: rtl;
  white-space: nowrap;
  text-overflow: ellipsis;
  unicode-bidi: plaintext;
  overflow: hidden;
}
.tab-index-indicator {
  margin-left: 8px;
  color: rgb(var(--theme-foreground) / 0.5);
  font-size: 12px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}
</style>
