<script lang="ts" setup>
import { ipcRenderer, nativeImage, shell } from 'electron'
import { watchEffect } from 'vue'
import { useMinimized, useMaximized } from '../compositions/frame'
import { useSettings } from '../compositions/settings'
import { useIsTabListEnabled } from '../compositions/shell'
import { showTabOptions, useCurrentTerminal, useTerminalActiveIndex, useTerminalTabs } from '../compositions/terminal'
import { translate, vI18n } from '../utils/i18n'
import { getPrompt, omitHome } from '../utils/terminal'

const settings = useSettings()
const tabs = $(useTerminalTabs())
const activeIndex = $(useTerminalActiveIndex())
const terminal = $(useCurrentTerminal())

let isMaximized = $(useMaximized())
let isMinimized = $(useMinimized())
let isTabListEnabled = $(useIsTabListEnabled())

let iconBuffer = $ref<Buffer | undefined>()

const isEnabled: boolean = $computed(() => {
  return settings['terminal.view.frameType'] !== 'system'
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

const isCustomControlEnabled = process.platform !== 'darwin'

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

function startDraggingDirectory() {
  ipcRenderer.invoke('drag-file', fileOrDirectory, iconBuffer)
}

function minimize() {
  isMinimized = !isMinimized
}

function maximize() {
  isMaximized = !isMaximized
}

function close() {
  window.close()
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
  <header
    v-if="isEnabled"
    :class="['title-bar', { 'no-controls': !isCustomControlEnabled }]"
    @dblclick="maximize"
  >
    <div class="symmetrical-space"></div>
    <div class="title-wrapper">
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
    <div class="controls">
      <template v-if="isCustomControlEnabled">
        <div class="minimize button" @click="minimize">
          <span class="feather-icon icon-minus"></span>
        </div>
        <div class="maximize button" @click="maximize">
          <span
            :class="['feather-icon', isMaximized
              ? 'icon-minimize-2' : 'icon-maximize-2']"
          ></span>
        </div>
        <div class="close button" @click="close">
          <span class="feather-icon icon-x"></span>
        </div>
      </template>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.title-bar {
  z-index: 1;
  display: flex;
  flex: none;
  justify-content: space-between;
  height: 36px;
  line-height: 36px;
  text-align: center;
  background: rgb(var(--material-background) / var(--theme-opacity));
  -webkit-app-region: drag;
}
.controls,
.symmetrical-space {
  display: flex;
  flex: 1 0 auto;
  width: 108px;
}
.title-wrapper {
  display: flex;
  flex: 2 0 auto;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  max-width: calc(100vw - 216px);
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
.run-script:hover {
  color: rgb(var(--system-green));
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
.title-bar.no-controls .symmetrical-space {
  order: 1;
  justify-content: flex-end;
  padding-right: 16px;
  padding-left: 0;
}
.controls {
  justify-content: flex-end;
  .title-bar.no-controls & {
    order: -1;
  }
}
.tab-index-indicator {
  margin-left: 8px;
  color: rgb(var(--theme-foreground) / 0.5);
  font-size: 12px;
  cursor: pointer;
  -webkit-app-region: no-drag;
}
.button {
  width: 36px;
  height: 36px;
  transition: color 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
  &.minimize:hover {
    color: rgb(var(--system-green));
  }
  &.maximize:hover {
    color: rgb(var(--system-yellow));
  }
  &.close:hover {
    color: rgb(var(--system-red));
  }
}
</style>
