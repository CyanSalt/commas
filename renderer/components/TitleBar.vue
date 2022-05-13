<script lang="ts" setup>
import { ipcRenderer, nativeImage, shell } from 'electron'
import { watchEffect } from 'vue'
import { useMinimized, useMaximized } from '../compositions/frame'
import { useSettings } from '../compositions/settings'
import { useIsTabListEnabled } from '../compositions/shell'
import { showTabOptions, useCurrentTerminal, useTerminalActiveIndex, useTerminalTabs } from '../compositions/terminal'
import { translate, vI18n } from '../utils/i18n'
import { getPrompt } from '../utils/terminal'

const settings = $(useSettings())
const tabs = $(useTerminalTabs())
const activeIndex = $(useTerminalActiveIndex())
const terminal = $(useCurrentTerminal())

let isMaximized = $(useMaximized())
let isMinimized = $(useMinimized())
let isTabListEnabled = $(useIsTabListEnabled())

let iconBuffer = $ref<Buffer | undefined>()

const isEnabled = $computed(() => {
  return settings['terminal.style.frameType'] !== 'system'
})

const directory = $computed(() => {
  if (!terminal || terminal.pane) return ''
  return terminal.cwd
})

const pane = $computed(() => {
  if (!terminal) return null
  return terminal.pane
})

const title = $computed(() => {
  if (!terminal) return ''
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (directory) return getPrompt('\\w', terminal)
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (directory && process.platform === 'darwin' && settings['terminal.tab.liveIcon']) {
    iconBuffer = await ipcRenderer.invoke('get-icon', directory)
  } else {
    iconBuffer = defaultIconBuffer
  }
}

watchEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

function openDirectory() {
  shell.openPath(directory)
}

function startDraggingDirectory() {
  ipcRenderer.invoke('drag-file', directory, iconBuffer)
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
    title: `${pane ? translate(pane.title) : title}`,
    directory,
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
        v-if="directory"
        draggable="true"
        class="shortcut open-directory"
        @click="openDirectory"
        @dragstart.prevent="startDraggingDirectory"
      >
        <img v-if="icon" class="directory-icon" :src="icon">
        <span v-else class="feather-icon icon-folder"></span>
      </a>
      <div v-if="pane" v-i18n class="title-text">{{ pane.title }}</div>
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
  background: rgb(var(--theme-background));
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
}
.shortcut {
  flex: none;
  margin-right: 8px;
  transition: color 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
}
.open-directory:hover {
  color: rgb(var(--design-blue));
}
.run-script:hover {
  color: rgb(var(--design-green));
}
.directory-icon {
  width: 16px;
  vertical-align: -2.5px;
  transition: opacity 0.2s;
  .open-directory:active & {
    opacity: 0.5;
  }
}
.title-text {
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
    color: rgb(var(--design-green));
  }
  &.maximize:hover {
    color: rgb(var(--design-yellow));
  }
  &.close:hover {
    color: rgb(var(--design-red));
  }
}
</style>
