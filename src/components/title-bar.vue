<template>
  <div v-if="!fullscreen" :class="['title-bar', {'no-controls': platform === 'darwin'}]">
    <div class="git-branch">
      <template v-if="branch">
        <span class="branch-updater" @click="updateBranch">
          <span class="feather-icon icon-git-branch"></span>
        </span>
        <span class="branch-name">{{ branch }}</span>
      </template>
    </div>
    <div class="title-wrapper">
      <div v-if="directory" class="open-directory" @click="open">
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
          <span :class="['feather-icon', maximized ?
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
import {remote, ipcRenderer, shell} from 'electron'
import {mapState, mapGetters} from 'vuex'
import {getPrompt, resolveHome} from '@/utils/terminal'
import {exec as execCallback} from 'child_process'
import {promisify} from 'util'

const exec = promisify(execCallback)

export default {
  name: 'TitleBar',
  data() {
    const frame = remote.getCurrentWindow()
    return {
      frame,
      maximized: frame.isMaximized(),
      fullscreen: frame.isFullScreen(),
      platform: process.platform,
      branch: '',
    }
  },
  computed: {
    ...mapState('settings', ['settings']),
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
  },
  watch: {
    title(value) {
      document.title = value
    },
    directory() {
      this.updateBranch()
    },
  },
  created() {
    ipcRenderer.on('maximize', () => {
      this.maximized = true
    })
    ipcRenderer.on('unmaximize', () => {
      this.maximized = false
    })
    ipcRenderer.on('enter-full-screen', () => {
      this.fullscreen = true
    })
    ipcRenderer.on('leave-full-screen', () => {
      this.fullscreen = false
    })
  },
  methods: {
    minimize() {
      this.frame.minimize()
    },
    maximize() {
      if (this.frame.isMaximized()) {
        this.frame.unmaximize()
      } else {
        this.frame.maximize()
      }
    },
    close() {
      this.frame.close()
    },
    open() {
      shell.openItem(resolveHome(this.directory))
    },
    async updateBranch() {
      if (!this.directory) {
        this.branch = ''
        return
      }
      const command = process.platform === 'win32' ?
        'git rev-parse --abbrev-ref HEAD 2> NUL' :
        'git branch 2> /dev/null | grep \\* | cut -d " " -f2'
      try {
        const {stdout} = await exec(command, {cwd: resolveHome(this.directory)})
        this.branch = stdout
      } catch (err) {
        // Git for Windows will throw error if the directory is not a repository
        this.branch = ''
      }
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
.title-bar .title-wrapper .open-directory {
  flex: none;
  margin-right: 8px;
  cursor: pointer;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
}
.title-bar .title-wrapper .open-directory:hover {
  color: var(--design-blue);
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
