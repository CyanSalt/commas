<template>
  <div :class="['tab', {active}]">
    <div class="tab-overview">
      <div class="tab-name">{{ name }}</div>
      <div class="operations">
        <slot name="operations"></slot>
        <div class="close" @click="close">
          <span class="feather-icon icon-x"></span>
        </div>
      </div>
    </div>
    <div class="tab-title">{{ realtitle }}</div>
    <div class="divider"></div>
  </div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'

export default {
  name: 'tab-item',
  props: {
    title: {
      type: String,
      default: '',
    },
    tab: {
      type: Object,
      default: null,
    },
  },
  computed: {
    tabs: VueMaye.state('terminal.tabs'),
    focus: VueMaye.state('terminal.active'),
    active() {
      return this.tabs[this.focus] === this.tab
    },
    name() {
      if (!this.tab) return '-'
      VueMaye.watch('terminal.tabs')
      return this.tab.process
    },
    realtitle() {
      if (this.title) return this.title
      if (!this.tab) return '-'
      VueMaye.watch('terminal.tabs')
      return this.tab.title || this.tab.id
    }
  },
  methods: {
    close() {
      if (!this.tab) return
      const {action} = this.$maye
      action.dispatch('terminal.close', this.tab)
    },
  },
}
</script>

<style>
.tab-list .tab {
  width: 144px;
}
.tab-list .tab-name,
.tab-list .tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.5;
}
.tab-list .tab.active .tab-name,
.tab-list .tab.active .tab-title {
  opacity: 1;
}
.tab-list .tab-overview {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  height: 32px;
  line-height: 32px;
}
.tab-list .tab .operations {
  flex: none;
  display: none;
}
.tab-list .tab:hover .operations {
  display: flex;
}
.tab-list .close {
  cursor: pointer;
  transition: color 0.2s;
}
.tab-list .close:hover {
  color: var(--theme-brightred);
}
.tab-list .divider {
  height: 1px;
  margin: 7px 0;
  border-bottom: 2px solid;
  opacity: 0.05;
}
.tab-list .tab.active .divider {
  color: var(--theme-brightcyan);
  opacity: 1;
}
</style>
