<template>
  <internal-panel class="user-settings-panel">
    <h2 class="group-title" v-i18n>User Settings#!user-settings.1</h2>
    <div class="group">
      <div class="action-line">
        <span :class="['link form-action revert', {disabled: !changed}]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', {disabled: !changed}]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <user-settings-line v-for="row in rows" :key="row.key"
        v-model="values[row.key]" :spec="row"></user-settings-line>
    </div>
  </internal-panel>
</template>

<script>
import UserSettingsLine from './user-settings-line'
import hooks from '@/hooks'
import {mapState} from 'vuex'
import {cloneDeep, isEqual} from 'lodash'

export default {
  name: 'SettingsPanel',
  components: {
    'user-settings-line': UserSettingsLine,
    ...hooks.workspace.component.pick([
      'internal-panel',
    ]),
  },
  data() {
    return {
      values: {},
    }
  },
  computed: {
    ...mapState('settings', ['specs', 'settings']),
    rows() {
      return this.specs
        .filter((item) => (
          !Array.isArray(item.configurable)
            || item.configurable.includes(process.platform)
        ))
        .map(item => {
          item = {...item}
          if (item.label) item.label += `#!user-settings.${item.key}`
          return item
        })
    },
    changed() {
      return !isEqual(this.settings, this.values)
    },
  },
  watch: {
    settings: {
      handler(value, oldValue) {
        if (value === oldValue) return
        this.revert()
      },
      immediate: true,
    },
  },
  methods: {
    revert() {
      this.values = cloneDeep(this.settings)
    },
    confirm() {
      this.$store.dispatch('settings/overwrite', this.values)
    },
  },
}
</script>

<style>
.user-settings-panel .form-action {
  margin: 0;
}
.user-settings-panel .revert {
  color: var(--design-red);
}
.user-settings-panel .confirm {
  color: var(--design-green);
}
.user-settings-panel .revert.disabled,
.user-settings-panel .confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
</style>
