<template>
  <div :class="['tab-item', {active: focused}]">
    <div class="tab-overview">
      <div class="tab-title">
        <span v-if="icon" :class="['tab-icon', icon.icon]"></span>
        <span class="tab-name">{{ title }}</span>
      </div>
      <div class="right-side">
        <div v-if="idleState" :class="['idle-light', idleState]"></div>
        <div class="operations">
          <slot name="operations"></slot>
          <div v-if="tab" class="button close" @click.stop="close">
            <div class="feather-icon icon-x"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import {getPrompt, getIcon} from '../utils/terminal'
import {basename} from 'path'

export default {
  name: 'TabItem',
  props: {
    name: {
      type: String,
      default: '',
    },
    tab: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapState('terminal', ['tabs', 'active']),
    ...mapGetters('settings', ['settings']),
    focused() {
      return this.tabs[this.active] === this.tab
    },
    title() {
      if (this.name) return this.name
      if (process.platform !== 'win32' && this.tab.title) return this.tab.title
      const expr = this.settings['terminal.tab.titleFormat']
      return getPrompt(expr, this.tab) || this.tab.process
    },
    idleState() {
      if (!this.tab || this.tab.internal) return ''
      if (this.tab.process === basename(this.tab.shell)) return 'idle'
      return 'busy'
    },
    icon() {
      if (this.name || !this.tab) return null
      if (this.tab.internal) return this.tab.internal
      return getIcon(this.tab.process)
    },
  },
  methods: {
    close() {
      if (!this.tab) return
      this.$store.dispatch('terminal/close', this.tab)
    },
  },
}
</script>

<style>
.tab-item {
  padding: 0 16px;
}
.tab-item .tab-title {
  flex: auto;
  width: 0;
  display: flex;
  align-items: center;
  opacity: 0.5;
}
.tab-item.active .tab-title {
  opacity: 1;
}
.tab-item .tab-icon {
  flex: none;
  display: inline-block;
  margin-right: 6px;
}
.tab-item .tab-icon.feather-icon {
  margin-top: -2px;
}
.tab-item .tab-name {
  flex: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-item .tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--tab-height);
}
.tab-item .tab-overview::before {
  content: '';
  position: absolute;
  top: 11px;
  bottom: 11px;
  transform: scale(0);
  left: -16px;
  border-left: 5px solid var(--design-blue);
  transition: transform 0.15s, border-color 0.2s;
}
.tab-item.active .tab-overview::before {
  transform: scale(1);
}
.tab-item .right-side {
  flex: none;
}
.tab-item .idle-light {
  display: inline-block;
  margin: 0 6px;
  width: 6px;
  height: 6px;
  vertical-align: 1px;
  border-radius: 50%;
  background: currentColor;
  transition: color 0.2s;
}
.tab-item .idle-light.busy {
  color: var(--design-green);
}
.tab-item .operations {
  display: none;
  text-align: center;
  font-size: 14px;
}
.tab-item:hover .idle-light {
  display: none;
}
.tab-item:hover .operations {
  display: flex;
}
.tab-item .operations .button {
  width: 18px;
  cursor: pointer;
  transition: color 0.2s;
}
.tab-item .close:hover {
  color: var(--design-red);
}
.tab-item .divider {
  border-bottom: 1px solid rgba(127, 127, 127, 0.1);
}
.sortable-item.dragging .tab-item .tab-overview::before {
  transform: scale(1);
  border-left-color: var(--design-yellow);
}
.sortable-item.dragging .tab-item .tab-title {
  opacity: 1;
}
</style>
