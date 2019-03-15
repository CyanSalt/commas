<template>
  <div :class="['tab', {active, thin: !tab}]">
    <div class="tab-overview">
      <div class="tab-title">{{ title }}</div>
      <div class="operations">
        <slot name="operations"></slot>
        <div class="button close" @click.stop="close" v-if="tab">
          <span class="feather-icon icon-x"></span>
        </div>
      </div>
    </div>
    <div class="tab-subtitle" v-if="tab">{{ subtitle }}</div>
    <div class="divider"></div>
  </div>
</template>

<script>
import * as VueMaye from 'maye/plugins/vue'

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
    short: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tabs: VueMaye.state('terminal.tabs'),
    focus: VueMaye.state('terminal.active'),
    active() {
      return this.tabs[this.focus] === this.tab
    },
    title() {
      if (!this.tab) return this.name
      const {state, $vue} = this.$maye
      $vue.watch('terminal.tabs')
      const settings = state.get('settings.user')
      const expr = settings['terminal.tab.titleFormat']
      return (function ({title, name, process, id}) {
        // eslint-disable-next-line no-eval
        return eval('`' + expr + '`')
      })(this.tab)
    },
    subtitle() {
      const {state, $vue} = this.$maye
      $vue.watch('terminal.tabs')
      const settings = state.get('settings.user')
      const expr = settings['terminal.tab.subtitleFormat']
      return (function ({title, name, process, id}) {
        // eslint-disable-next-line no-eval
        return eval('`' + expr + '`')
      })(this.tab)
    },
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
.tab .tab-title,
.tab .tab-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.5;
}
.tab.active .tab-title,
.tab.active .tab-subtitle {
  opacity: 1;
}
.tab .tab-overview {
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
.tab:not(.thin) .tab-title {
  font-size: 18px;
}
.tab .operations {
  flex: none;
  display: none;
  text-align: center;
  font-size: 16px;
}
.tab:hover .operations {
  display: flex;
}
.tab .operations .button {
  width: 18px;
  cursor: pointer;
  transition: color 0.2s;
}
.tab .close:hover {
  color: var(--theme-brightred);
}
.tab .divider {
  height: 1px;
  margin: 7px 0;
  border-bottom: 2px solid;
  opacity: 0.05;
}
.tab.active .divider {
  color: var(--theme-brightcyan);
  opacity: 1;
}
</style>
