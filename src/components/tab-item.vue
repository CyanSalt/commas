<template>
  <div :class="['tab-item', {active: focused}]">
    <div class="tab-overview">
      <div class="tab-title">{{ title }}</div>
      <div class="right-side">
        <div v-if="idleState" :class="['idle-light', idleState]"></div>
        <div class="operations">
          <slot name="operations"></slot>
          <div class="button close" @click.stop="close" v-if="tab">
            <span class="feather-icon icon-x"></span>
          </div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import {getPrompt} from '@/utils/terminal'
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
    ...mapState('settings', ['settings']),
    ...mapState('terminal', ['tabs', 'active']),
    ...mapGetters('terminal', ['shell']),
    focused() {
      return this.tabs[this.active] === this.tab
    },
    title() {
      if (this.name) return this.name
      if (this.tab.title) return this.tab.title
      const expr = this.settings['terminal.tab.titleFormat']
      return getPrompt(expr, this.tab) || this.tab.process
    },
    idleState() {
      if (!this.tab || this.tab.internal) return ''
      if (this.tab.process === basename(this.shell)) return 'idle'
      return 'busy'
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
.tab-item .tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.5;
}
.tab-item.active .tab-title {
  opacity: 1;
}
.tab-item .tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
.tab-item .tab-overview::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  transform: scale(0);
  left: -16px;
  /* blue from Google */
  border-left: 5px solid #4285f4;
  transition: transform 0.15s;
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
  color: #28c941;
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
  color: #ff6159;
}
.tab-item .divider {
  height: 1px;
  margin: 7px 0;
  border-bottom: 2px solid;
  opacity: 0.05;
}
</style>
