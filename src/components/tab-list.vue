<template>
  <div class="tab-list">
    <div class="list" :style="{width: width + 'px'}">
      <div class="processes">
        <tab-item :tab="tab" @click.native="activite(tab)"
          v-for="(tab, index) in running" :key="tab.id"></tab-item>
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
        <tab-item :tab="launcher.tab" :title="launcher.name"
          @click.native="open(launcher)"
          v-for="(launcher, index) in filtered" :key="index"
          v-show="!collapsed || launcher.tab">
            <template slot="operations">
              <div class="launch" @click="launch(launcher)">
                <span class="feather-icon icon-play"></span>
              </div>
            </template>
          </tab-item>
        <div class="edit-launcher anchor" @click="edit" v-show="!collapsed">
          <span class="feather-icon icon-plus"></span>
        </div>
      </div>
    </div>
    <scroll-bar></scroll-bar>
    <div class="sash" @mousedown.left="resize"></div>
  </div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'
import TabItem from './tab-item'
import ScrollBar from './scroll-bar'

export default {
  name: 'tab-list',
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
    tabs: VueMaye.state('terminal.tabs'),
    launchers: VueMaye.state('launcher.all'),
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
    spawn: VueMaye.action('terminal.spawn'),
    activite: VueMaye.action('terminal.activite'),
    open: VueMaye.action('launcher.activite'),
    launch: VueMaye.action('launcher.launch'),
    expandOrCollapse() {
      this.collapsed = !this.collapsed
    },
    edit() {
      const {action} = this.$maye
      action.dispatch('command.exec', 'open-launchers')
    },
    resize(e) {
      const original = this.width
      const start = e.clientX
      const max = document.body.clientWidth / 2
      const handler = event => {
        const width = original + event.clientX - start
        this.width = Math.min(Math.max(width, 96), max)
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
  position: relative;
  font-size: 14px;
}
.tab-list .list {
  flex: auto;
  width: 176px;
  padding: 4px 16px;
  overflow-y: auto;
  box-sizing: border-box;
}
.tab-list .list::-webkit-scrollbar {
  width: 0px;
}
.tab-list .scroll-bar {
  width: 8px;
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
  padding-top: 17px;
  position: sticky;
  /* use padding + top instead of margin
     for blink's bug of `backdrop-filter` */
  top: -17px;
  z-index: 1;
  cursor: pointer;
  /* erase backdrop text */
  background: var(--theme-background);
  backdrop-filter: opacity(0);
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
.tab-list .anchor {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.tab-list .anchor:hover {
  opacity: 1;
}
.tab-list .launch:hover {
  color: var(--theme-green);
}
</style>
