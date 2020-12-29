<template>
  <header :class="['title-bar', { 'no-controls': !isCustomControlEnabled }]" @dblclick="maximize">
    <div class="git-branch">
      <template v-if="branch">
        <span class="branch-updater" @click="updateBranch">
          <span class="feather-icon icon-git-branch"></span>
        </span>
        <span class="branch-name">{{ branch }}</span>
      </template>
    </div>
    <div class="title-wrapper">
      <div v-if="scripts.length" class="shortcut run-script" @click="runScript">
        <span class="feather-icon icon-play"></span>
      </div>
      <div v-if="directory" class="shortcut open-directory" @click="openDirectory">
        <span class="feather-icon icon-folder"></span>
      </div>
      <div v-if="pane" v-i18n class="title-text">{{ pane.title }}</div>
      <div v-else class="title-text">{{ title }}</div>
      <div class="tab-index-indicator" @click="toggleTabList">
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

<script>
import { ipcRenderer, shell } from 'electron'
import { reactive, computed, watchEffect, toRefs, unref } from 'vue'
import { useMinimized, useMaximized } from '../hooks/frame.mjs'
import { getLauncherByTerminalTab } from '../hooks/launcher.mjs'
import { useSettings } from '../hooks/settings.mjs'
import { useIsTabListEnabled } from '../hooks/shell.mjs'
import { useCurrentTerminal, useTerminalActiveIndex, useTerminalTabs } from '../hooks/terminal.mjs'
import { openContextMenu } from '../utils/frame.mjs'
import { getPrompt } from '../utils/terminal.mjs'

export default {
  name: 'title-bar',
  setup() {
    const state = reactive({
      isMaximized: useMaximized(),
      isTabListEnabled: useIsTabListEnabled(),
      tabs: useTerminalTabs(),
      activeIndex: useTerminalActiveIndex(),
      branch: '',
    })

    state.isCustomControlEnabled = computed(() => {
      return process.platform !== 'darwin'
    })

    const terminalRef = useCurrentTerminal()
    state.directory = computed(() => {
      const terminal = unref(terminalRef)
      if (!terminal || terminal.pane) return ''
      return getPrompt('\\w', terminal)
    })

    state.pane = computed(() => {
      const terminal = unref(terminalRef)
      if (!terminal) return null
      return terminal.pane
    })

    const settingsRef = useSettings()
    state.title = computed(() => {
      if (state.directory) return state.directory
      const terminal = unref(terminalRef)
      if (terminal && terminal.title) return terminal.title
      const settings = unref(settingsRef)
      const expr = settings['terminal.tab.titleFormat']
      return getPrompt(expr, terminal)
    })

    const launcherRef = computed(() => {
      const terminal = unref(terminalRef)
      if (!terminal) return null
      return getLauncherByTerminalTab(terminal)
    })
    state.scripts = computed(() => {
      const launcher = unref(launcherRef)
      if (launcher && launcher.scripts) {
        return launcher.scripts
      }
      return []
    })

    async function updateBranch() {
      if (!state.directory) {
        state.branch = ''
        return
      }
      state.branch = await ipcRenderer.invoke('get-git-branch', state.directory)
    }

    watchEffect(updateBranch)

    function runScript(event) {
      const launcher = unref(launcherRef)
      openContextMenu(
        state.scripts.map((script, index) => ({
          label: script.name || script.command,
          command: 'run-script',
          args: {
            launcher,
            index,
          },
        })),
        event,
      )
    }

    function openDirectory() {
      shell.openPath(state.directory)
    }

    const isMinimizedRef = useMinimized()
    function minimize() {
      isMinimizedRef.value = !isMinimizedRef.value
    }

    function maximize() {
      state.isMaximized = !state.isMaximized
    }

    function close() {
      window.close()
    }

    function toggleTabList() {
      state.isTabListEnabled = !state.isTabListEnabled
    }

    return {
      ...toRefs(state),
      updateBranch,
      runScript,
      openDirectory,
      minimize,
      maximize,
      close,
      toggleTabList,
    }
  },
}
</script>

<style>
.title-bar {
  flex: none;
  height: 36px;
  line-height: 36px;
  display: flex;
  justify-content: space-between;
  text-align: center;
  -webkit-app-region: drag;
  z-index: 1;
}
.title-bar .git-branch,
.title-bar .controls {
  flex: 1 0 auto;
  display: flex;
  width: 108px;
}
.title-bar .title-wrapper {
  padding: 0 8px;
  max-width: calc(100vw - 216px);
  box-sizing: border-box;
  flex: 2 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.title-bar .title-wrapper .shortcut {
  flex: none;
  margin-right: 8px;
  cursor: pointer;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
}
.title-bar .title-wrapper .open-directory:hover {
  color: var(--design-blue);
}
.title-bar .title-wrapper .run-script:hover {
  color: var(--design-green);
}
.title-bar .title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* Show ellipsis on left */
  direction: rtl;
  unicode-bidi: plaintext;
}
.title-bar .git-branch {
  padding-left: 16px;
  box-sizing: border-box;
}
.title-bar .branch-updater {
  margin-right: 4px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  -webkit-app-region: no-drag;
}
.title-bar .branch-updater:hover {
  opacity: 1;
}
.title-bar .branch-name {
  opacity: 0.5;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title-bar .controls {
  justify-content: flex-end;
}
.title-bar.no-controls .git-branch {
  order: 1;
  padding-left: 0;
  padding-right: 16px;
  justify-content: flex-end;
}
.title-bar.no-controls .controls {
  order: -1;
}
.title-bar .tab-index-indicator {
  margin-left: 8px;
  font-size: 12px;
  cursor: pointer;
  -webkit-app-region: no-drag;
  opacity: 0.5;
}
.title-bar .controls .button {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
}
.title-bar .button.minimize:hover {
  color: var(--design-green);
}
.title-bar .button.maximize:hover {
  color: var(--design-yellow);
}
.title-bar .button.close:hover {
  color: var(--design-red);
}
</style>
