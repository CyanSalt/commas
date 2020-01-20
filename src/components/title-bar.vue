<template>
  <div :class="['title-bar', {'no-controls': platform === 'darwin'}]">
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
      <div v-if="directory" class="shortcut open-directory" @click="open">
        <span class="feather-icon icon-folder"></span>
      </div>
      <div class="title-text">{{ directory || title }}</div>
    </div>
    <div class="controls">
      <template v-if="platform !== 'darwin'">
        <div class="minimize button" @click="minimize">
          <span class="feather-icon icon-minus"></span>
        </div>
        <div class="maximize button" @click="maximize">
          <span :class="['feather-icon', currentState.maximized ?
            'icon-minimize-2' : 'icon-maximize-2']"></span>
        </div>
        <div class="close button" @click="close">
          <span class="feather-icon icon-x"></span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {shell} from 'electron'
import {mapState, mapGetters} from 'vuex'
import {getPrompt, resolveHome, getGitBranch} from '@/utils/terminal'
import {currentWindow, currentState} from '@/utils/frame'
import {getTabLauncher} from '@/utils/launcher'
import hooks from '@/hooks'

export default {
  name: 'TitleBar',
  data() {
    return {
      currentWindow,
      currentState,
      platform: process.platform,
      branch: '',
    }
  },
  computed: {
    ...mapState('settings', ['settings']),
    ...mapState('launcher', ['launchers']),
    ...mapGetters('terminal', ['current']),
    directory() {
      if (!this.current || this.current.internal) return ''
      return getPrompt('\\w', this.current)
    },
    title() {
      if (this.current && this.current.title) return this.current.title
      const expr = this.settings['terminal.tab.titleFormat']
      return getPrompt(expr, this.current)
    },
    launcher() {
      if (this.current && this.current.launcher) {
        return getTabLauncher(this.launchers, this.current)
      }
      return null
    },
    scripts() {
      if (this.launcher && this.launcher.scripts) return this.launcher.scripts
      return []
    },
  },
  watch: {
    title(value) {
      document.title = value
    },
    directory() {
      this.updateBranch()
    },
  },
  methods: {
    minimize() {
      this.currentWindow.minimize()
    },
    maximize() {
      if (this.currentWindow.isMaximized()) {
        this.currentWindow.unmaximize()
      } else {
        this.currentWindow.maximize()
      }
    },
    close() {
      this.currentWindow.close()
    },
    open() {
      shell.openItem(resolveHome(this.directory))
    },
    runScript(event) {
      hooks.shell.openContextByEvent(event, this.scripts.map((script, index) => ({
        label: script.name || script.command,
        command: 'run-script',
        args: {
          launcher: this.launcher,
          index: index,
        },
      })))
    },
    async updateBranch() {
      if (!this.directory) {
        this.branch = ''
        return
      }
      this.branch = await getGitBranch(this.directory)
    },
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
