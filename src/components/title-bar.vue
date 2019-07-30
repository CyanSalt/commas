<template>
  <div class="title-bar" v-if="!fullscreen">
    <div class="left"></div>
    <div class="title-text">{{ title }}</div>
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
import {remote, ipcRenderer} from 'electron'
import {mapState, mapGetters} from 'vuex'
import {getPrompt} from '@/utils/terminal'

export default {
  name: 'TitleBar',
  data() {
    const frame = remote.getCurrentWindow()
    return {
      frame,
      maximized: frame.isMaximized(),
      fullscreen: frame.isFullScreen(),
      platform: process.platform,
    }
  },
  computed: {
    ...mapState('settings', ['settings']),
    ...mapGetters('terminal', ['current']),
    title() {
      if (this.current && this.current.title) return this.current.title
      const expr = this.settings['terminal.window.titleFormat']
      return getPrompt(expr, this.current)
    },
  },
  watch: {
    title(value) {
      document.title = value
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
.title-bar .left,
.title-bar .controls {
  flex: none;
  display: flex;
  width: 108px;
}
.title-bar .title-text {
  flex: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* Show ellipsis on left */
  direction: rtl;
  unicode-bidi: plaintext;
}
.title-bar .controls {
  -webkit-app-region: no-drag;
}
.title-bar .button {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: color 0.2s;
}
/* colors from macOS */
.title-bar .button.minimize:hover {
  color: #28c941;
}
.title-bar .button.maximize:hover {
  color: #ffbd2e;
}
.title-bar .button.close:hover {
  color: #ff6159;
}
</style>
