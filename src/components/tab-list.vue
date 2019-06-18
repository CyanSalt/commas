<template>
  <div class="tab-list">
    <div class="list-column" :style="{width: width + 'px'}">
      <div class="scroll-area">
        <div class="list">
          <div class="processes">
            <tab-item :tab="tab" @click.native="activite(tab)"
              v-for="tab in running" :key="tab.id"></tab-item>
            <div class="new-tab anchor" @click="spawn()">
              <span class="feather-icon icon-plus"></span>
            </div>
          </div>
          <div class="launcher-folder" @click="expandOrCollapse">
            <div class="group-name">{{ i18n('Launchers#!5') }}</div>
            <div class="buttons">
              <div :class="['button', 'find', {active: finding}]"
                @click.stop="find">
                <span class="feather-icon icon-search"></span>
              </div>
              <div class="button indicator">
                <span class="feather-icon icon-chevron-up" v-if="collapsed"></span>
                <span class="feather-icon icon-chevron-down" v-else></span>
              </div>
            </div>
          </div>
          <div class="find-launcher" v-show="finding">
            <input class="keyword" v-model="keyword" :placeholder="i18n('Find#!6')"
              @keyup.esc="find" ref="keyword" autofocus>
          </div>
          <div class="launchers">
            <tab-item :tab="getLauncherTab(launcher)" :name="launcher.name"
              @click.native="open(launcher)"
              v-for="launcher in filtered" :key="launcher.id"
              v-show="!collapsed || getLauncherTab(launcher)">
                <template #operations>
                  <div class="button launch" @click.stop="launch(launcher)">
                    <span class="feather-icon icon-play"></span>
                  </div>
                  <div class="button assign" @click.stop="assign(launcher)">
                    <span class="feather-icon icon-external-link"></span>
                  </div>
                </template>
              </tab-item>
            <div class="edit-launcher anchor" @click="edit" v-show="!collapsed">
              <span class="feather-icon icon-plus"></span>
            </div>
          </div>
        </div>
        <scroll-bar></scroll-bar>
      </div>
      <div class="bottom-actions">
        <div class="anchor" @click="configure()">
          <span class="feather-icon icon-settings"></span>
        </div>
        <div :class="['anchor', 'proxy-server', {active: serving}]" @click="proxy()">
          <span class="feather-icon icon-navigation"></span>
          <span v-if="serving" class="server-port">{{ port }}</span>
        </div>
      </div>
    </div>
    <div class="sash" @mousedown.left="resize"></div>
  </div>
</template>

<script>
import TabItem from './tab-item'
import ScrollBar from './scroll-bar'
import {getLauncherTab} from '@/utils/launcher'
import {mapState, mapGetters, mapActions} from 'vuex'

export default {
  name: 'TabList',
  components: {
    'tab-item': TabItem,
    'scroll-bar': ScrollBar,
  },
  data() {
    return {
      width: 176,
      collapsed: true,
      finding: false,
      keyword: '',
    }
  },
  computed: {
    ...mapState('terminal', ['tabs']),
    ...mapState('launcher', ['launchers']),
    ...mapState('proxy', ['serving']),
    ...mapGetters('proxy', ['port']),
    running() {
      return this.tabs.filter(tab => !tab.launcher)
    },
    filtered() {
      if (!this.keyword) return this.launchers
      const keywords = this.keyword.toLowerCase().split(/\s+/)
      return this.launchers.filter(launcher => keywords.every(keyword =>
        Object.values(launcher).join(' ').toLowerCase().indexOf(keyword) !== -1))
    },
  },
  methods: {
    ...mapActions('terminal', ['spawn', 'activite']),
    ...mapActions('launcher', ['open', 'launch', 'assign']),
    getLauncherTab(launcher) {
      return getLauncherTab(this.tabs, launcher)
    },
    expandOrCollapse() {
      this.collapsed = !this.collapsed
    },
    edit() {
      this.$store.dispatch('command/exec', 'open-launchers')
    },
    configure() {
      this.$store.dispatch('command/exec', 'open-settings')
    },
    proxy() {
      if (this.serving) {
        this.$store.dispatch('proxy/close')
      } else {
        this.$store.dispatch('proxy/open')
      }
    },
    resize(e) {
      const original = this.width
      const start = e.clientX
      const max = document.body.clientWidth / 2
      const handler = event => {
        const width = original + event.clientX - start
        this.width = Math.min(Math.max(width, 120), max)
      }
      const cancelation = () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', cancelation)
      }
      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', cancelation)
    },
    find() {
      if (this.finding) {
        this.keyword = ''
        this.$refs.keyword.blur()
      }
      this.finding = !this.finding
    },
  },
}
</script>

<style>
.tab-list {
  flex: none;
  display: flex;
  font-size: 14px;
}
.tab-list .list-column {
  flex: auto;
  width: 176px;
  display: flex;
  flex-direction: column;
}
.tab-list .scroll-area {
  flex: auto;
  height: 0;
  position: relative;
}
.tab-list .list {
  padding: 4px 16px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.tab-list .list::-webkit-scrollbar {
  width: 0px;
}
.tab-list .scroll-bar {
  width: 8px;
  right: 2px;
}
.tab-list .sash {
  flex: none;
  width: 2px;
  margin: 4px 0;
  border-right: 2px solid;
  opacity: 0.05;
  cursor: col-resize;
}
.tab-list .invisible {
  visibility: hidden;
}
.tab-list .only-end {
  margin-top: 0;
}
.tab-list .new-tab {
  height: 42px;
  line-height: 42px;
  font-size: 28px;
  text-align: center;
}
.tab-list .launcher-folder {
  display: flex;
  position: sticky;
  padding-top: 17px;
  padding-bottom: 8px;
  top: -17px;
  margin-bottom: -8px;
  z-index: 1;
  cursor: pointer;
  background: var(--theme-background);
}
.tab-list .group-name {
  flex: auto;
  color: var(--theme-brightmagenta);
}
.tab-list .launcher-folder .buttons {
  flex: none;
  display: flex;
}
.tab-list .launcher-folder .button {
  width: 20px;
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.tab-list .launcher-folder .find:hover,
.tab-list .launcher-folder:hover .indicator {
  opacity: 1;
}
.tab-list .find.active {
  opacity: 1;
  color: var(--theme-blue);
}
.tab-list .find-launcher,
.tab-list .launchers {
  margin-top: 8px;
}
.tab-list .find-launcher .keyword {
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  background: transparent;
}
.tab-list .edit-launcher {
  text-align: center;
  font-size: 18px;
  line-height: 26px;
  margin-bottom: 8px;
}
.tab-list .bottom-actions {
  flex: none;
  display: flex;
  padding: 4px 16px;
  line-height: 24px;
}
.tab-list .bottom-actions .anchor {
  margin-right: 8px;
}
.tab-list .server-port {
  vertical-align: 1px;
}
.tab-list .anchor {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.tab-list .anchor:hover,
.tab-list .anchor.active {
  opacity: 1;
}
.tab-list .launch:hover {
  color: var(--theme-green);
}
.tab-list .assign:hover {
  color: var(--theme-blue);
}
.tab-list .proxy-server.active {
  color: var(--theme-cyan);
}
</style>
