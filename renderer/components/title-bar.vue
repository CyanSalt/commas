<template>
  <header
    :class="['title-bar', { 'no-controls': !isCustomControlEnabled }]"
    @dblclick="maximize"
  >
    <div class="git-branch">
      <template v-if="branch">
        <span class="branch-updater" @click="updateBranch">
          <span class="feather-icon icon-git-branch"></span>
        </span>
        <span class="branch-name">{{ branch }}</span>
      </template>
    </div>
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

<script lang="ts">
import { ipcRenderer, nativeImage, shell } from 'electron'
import { computed, ref, unref, watchEffect } from 'vue'
import { useMinimized, useMaximized } from '../hooks/frame'
import { useSettings } from '../hooks/settings'
import { useIsTabListEnabled } from '../hooks/shell'
import { showTabOptions, useCurrentTerminal, useTerminalActiveIndex, useTerminalTabs } from '../hooks/terminal'
import { translate } from '../utils/i18n'
import { getPrompt } from '../utils/terminal'

export default {
  setup() {
    const isMaximizedRef = useMaximized()
    const isTabListEnabledRef = useIsTabListEnabled()
    const tabsRef = useTerminalTabs()
    const activeIndexRef = useTerminalActiveIndex()

    const iconBufferRef = ref<Buffer>()
    const branchRef = ref('')

    const terminalRef = useCurrentTerminal()
    const directoryRef = computed(() => {
      const terminal = unref(terminalRef)
      if (!terminal || terminal.pane) return ''
      return terminal.cwd
    })

    const paneRef = computed(() => {
      const terminal = unref(terminalRef)
      if (!terminal) return null
      return terminal.pane
    })

    const settingsRef = useSettings()
    const titleRef = computed(() => {
      const terminal = unref(terminalRef)
      if (!terminal) return ''
      const directory = unref(directoryRef)
      if (directory) return getPrompt('\\w', terminal)
      if (terminal.title) return terminal.title
      const settings = unref(settingsRef)
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
      const directory = unref(directoryRef)
      if (directory && process.platform === 'darwin') {
        iconBufferRef.value = await ipcRenderer.invoke('get-icon', directory)
      } else {
        iconBufferRef.value = defaultIconBuffer
      }
    }

    watchEffect(() => {
      iconBufferRef.value = defaultIconBuffer
      updateIcon()
    })

    const iconRef = computed(() => {
      const iconBuffer = unref(iconBufferRef)
      if (iconBuffer) {
        const blob = new Blob([iconBuffer], { type: 'image/png' })
        return URL.createObjectURL(blob)
      } else {
        return ''
      }
    })

    async function updateBranch() {
      const directory = unref(directoryRef)
      if (directory) {
        branchRef.value = await ipcRenderer.invoke('get-git-branch', directory)
      } else {
        branchRef.value = ''
      }
    }

    watchEffect(() => {
      branchRef.value = ''
      updateBranch()
    })

    function openDirectory() {
      const directory = unref(directoryRef)
      shell.openPath(directory)
    }

    function startDraggingDirectory() {
      const directory = unref(directoryRef)
      const iconBuffer = unref(iconBufferRef)
      ipcRenderer.invoke('drag-file', directory, iconBuffer)
    }

    const isMinimizedRef = useMinimized()
    function minimize() {
      isMinimizedRef.value = !isMinimizedRef.value
    }

    function maximize() {
      isMaximizedRef.value = !isMaximizedRef.value
    }

    function close() {
      window.close()
    }

    function toggleTabList() {
      isTabListEnabledRef.value = !isTabListEnabledRef.value
    }

    watchEffect(() => {
      const pane = unref(paneRef)
      const title = unref(titleRef)
      const directory = unref(directoryRef)
      ipcRenderer.invoke('update-window', {
        title: `${pane ? translate(pane.title) : title}`,
        directory,
      })
    })

    return {
      isCustomControlEnabled: process.platform !== 'darwin',
      isMaximized: isMaximizedRef,
      tabs: tabsRef,
      activeIndex: activeIndexRef,
      branch: branchRef,
      directory: directoryRef,
      pane: paneRef,
      title: titleRef,
      icon: iconRef,
      updateBranch,
      openDirectory,
      startDraggingDirectory,
      minimize,
      maximize,
      close,
      toggleTabList,
      showTabOptions,
    }
  },
}
</script>

<style lang="scss" scoped>
.title-bar {
  z-index: 1;
  display: flex;
  flex: none;
  justify-content: space-between;
  height: 36px;
  line-height: 36px;
  text-align: center;
  -webkit-app-region: drag;
}
.git-branch,
.controls {
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
.git-branch {
  box-sizing: border-box;
  padding-left: 16px;
  .title-bar.no-controls & {
    order: 1;
    justify-content: flex-end;
    padding-right: 16px;
    padding-left: 0;
  }
}
.branch-updater {
  margin-right: 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
  &:hover {
    opacity: 1;
  }
}
.branch-name {
  text-overflow: ellipsis;
  overflow: hidden;
  opacity: 0.5;
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
