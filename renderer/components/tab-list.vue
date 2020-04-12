<template>
  <div class="tab-list">
    <div class="list-column" :style="{width: width + 'px'}">
      <div class="list">
        <div class="scroll-area">
          <sortable-list
            v-slot="{value}"
            :value="running"
            class="processes"
            @change="sortTabs"
          >
            <tab-item
              :key="value.id"
              :tab="value"
              @click.native="activate(value)"
            ></tab-item>
          </sortable-list>
          <div class="new-tab">
            <div v-if="shells.length" class="select-shell anchor" @click="select">
              <span class="feather-icon icon-chevron-down"></span>
            </div>
            <div class="default-shell anchor" @click="spawn()">
              <span class="feather-icon icon-plus"></span>
            </div>
          </div>
          <div class="launcher-folder" @click="expandOrCollapse">
            <div v-i18n class="group-name">Launchers#!5</div>
            <div class="buttons">
              <div
                :class="['button', 'find', {active: finding}]"
                @click.stop="find"
              >
                <span class="feather-icon icon-search"></span>
              </div>
              <div class="button indicator">
                <span v-if="collapsed" class="feather-icon icon-chevron-down"></span>
                <span v-else class="feather-icon icon-chevron-up"></span>
              </div>
            </div>
            <div v-show="finding" class="find-launcher" @click.stop>
              <input
                ref="keyword"
                v-model="keyword"
                v-i18n
                class="keyword"
                placeholder="Find#!6"
                autofocus
                @keyup.esc="find"
              >
            </div>
          </div>
          <div class="launchers">
            <tab-item
              v-for="launcher in filtered"
              v-show="!collapsed || getLauncherTab(launcher)"
              :key="launcher.id"
              :tab="getLauncherTab(launcher)"
              :name="launcher.name"
              @click.native="open(launcher)"
            >
              <template #operations>
                <div class="button launch" @click.stop="launch(launcher)">
                  <span class="feather-icon icon-play"></span>
                </div>
                <div class="button assign" @click.stop="assign(launcher)">
                  <span class="feather-icon icon-external-link"></span>
                </div>
              </template>
            </tab-item>
          </div>
        </div>
        <scroll-bar></scroll-bar>
      </div>
      <div class="bottom-actions">
        <div class="anchor" @click="configure">
          <span class="feather-icon icon-settings"></span>
        </div>
        <component
          :is="anchor"
          v-for="(anchor, index) in anchors"
          :key="index"
          class="anchor"
        ></component>
      </div>
    </div>
    <div class="sash" @mousedown.left="resize"></div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import {basename} from 'path'
import TabItem from './tab-item'
import ScrollBar from './scroll-bar'
import SortableList from './sortable-list'
import {getLauncherTab} from '../utils/launcher'
import hooks from '@hooks'

export default {
  name: 'TabList',
  components: {
    'tab-item': TabItem,
    'scroll-bar': ScrollBar,
    'sortable-list': SortableList,
  },
  data() {
    return {
      width: 176,
      collapsed: true,
      finding: false,
      keyword: '',
      anchors: hooks.workspace.anchor.all(),
    }
  },
  computed: {
    ...mapState('terminal', ['tabs', 'shells']),
    ...mapState('launcher', ['launchers']),
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
    ...mapActions('terminal', ['spawn', 'activate']),
    ...mapActions('launcher', ['open', 'launch', 'assign']),
    getLauncherTab(launcher) {
      return getLauncherTab(this.tabs, launcher)
    },
    expandOrCollapse() {
      this.collapsed = !this.collapsed
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
    configure() {
      hooks.command.exec('interact-settings')
        || hooks.command.exec('open-settings')
    },
    select(event) {
      hooks.shell.openContextByEvent(event, this.shells.map(shell => ({
        label: basename(shell),
        command: 'open-tab',
        args: {
          shell,
        },
      })))
    },
    sortTabs(from, to) {
      this.$store.commit('terminal/moveTab', [
        this.running[from],
        this.running[to],
      ])
    },
  },
}
</script>

<style>
.tab-list {
  flex: none;
  display: flex;
  font-size: 14px;
  --tab-height: 46px;
}
.tab-list .list-column {
  flex: auto;
  width: 176px;
  display: flex;
  flex-direction: column;
}
.tab-list .list {
  flex: auto;
  height: 0;
  position: relative;
}
.tab-list .scroll-area {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.tab-list .scroll-area::-webkit-scrollbar {
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
  border-right: 2px solid rgba(127, 127, 127, 0.1);
  cursor: col-resize;
}
.tab-list .invisible {
  visibility: hidden;
}
.tab-list .new-tab {
  padding: 0 16px;
  display: flex;
  height: var(--tab-height);
  line-height: var(--tab-height);
  text-align: center;
}
.tab-list .new-tab .select-shell {
  flex: none;
  width: 18px;
}
.tab-list .new-tab .default-shell {
  flex: auto;
  font-size: 21px;
}
.tab-list .new-tab .select-shell + .default-shell {
  order: -1;
  padding-left: 18px;
}
.tab-list .launcher-folder {
  display: flex;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 16px;
  line-height: 16px;
  cursor: pointer;
  background: var(--theme-background);
}
.tab-list .group-name {
  flex: auto;
  color: var(--design-magenta);
}
.tab-list .launcher-folder .buttons {
  flex: none;
  display: flex;
}
.tab-list .launcher-folder .button {
  width: 18px;
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.tab-list .launcher-folder .button + .button {
  margin-left: 3px;
}
.tab-list .launcher-folder .find:hover,
.tab-list .launcher-folder:hover .indicator {
  opacity: 1;
}
.tab-list .find.active {
  opacity: 1;
  color: var(--design-blue);
}
.tab-list .find-launcher {
  flex-basis: 100%;
  margin-top: 8px;
}
.tab-list .find-launcher .keyword {
  padding: 0;
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
  padding: 8px 16px;
  line-height: 16px;
  height: 16px;
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
  color: var(--design-green);
}
.tab-list .assign:hover {
  color: var(--design-blue);
}
</style>