<template>
  <terminal-pane class="proxy-pane">
    <h2 v-i18n class="group-title">General#!settings.2</h2>
    <div class="group">
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.3</label>
        <switch-control v-model="isSystemProxyEnabled"></switch-control>
      </div>
      <span class="link" @click="openProxyRules">
        <span v-i18n="{ F: 'proxy-rules.json' }">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Proxy Rules#!proxy.1</h2>
    <div class="group">
      <div class="action-line">
        <span :class="['link form-action revert', { disabled: !isChanged }]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', { disabled: !isChanged }]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <div class="proxy-table">
        <div v-for="(rule, row) of table" :key="row" class="proxy-rule">
          <div v-for="(entry, index) in rule.context" :key="`entry:${index}`" class="rule-line">
            <span class="list-style">
              <span v-if="index === 0" class="link remove" @click="removeIndex(table, row)">
                <span class="feather-icon icon-minus-circle"></span>
              </span>
            </span>
            <span class="link remove" @click="removeIndex(rule.context, index)">
              <span class="feather-icon icon-minus"></span>
            </span>
            <input v-model="rule.context[index]" type="text" class="form-control">
          </div>
          <div class="rule-line">
            <span class="list-style">
              <span v-if="!rule.context.length" class="link remove" @click="removeIndex(table, row)">
                <span class="feather-icon icon-minus-circle"></span>
              </span>
            </span>
            <span class="link add" @click="addContext(rule)">
              <span class="feather-icon icon-plus"></span>
            </span>
            <span
              :class="['proxy-to', { active: isRecalling(rule), valid: rule.proxy.records }]"
              @click="recall(rule)"
            >
              <span class="feather-icon icon-corner-down-right"></span>
            </span>
            <input
              v-model="rule.proxy.target"
              v-i18n:placeholder
              type="text"
              :readonly="isRecalling(rule)"
              placeholder="Proxy to...#!proxy.4"
              class="form-control target"
            >
            <span v-if="rule.proxy.rewrite" class="rewriting">
              <span class="feather-icon icon-activity"></span>
            </span>
          </div>
          <template v-if="isRecalling(rule)">
            <div
              v-for="(record, index) in rule.proxy.records"
              :key="`record:${index}`"
              class="rule-line"
            >
              <span class="list-style"></span>
              <span class="link record-action remove" @click="removeIndex(rule.proxy.records, index)">
                <span class="feather-icon icon-x"></span>
              </span>
              <span class="link record-action confirm" @click="useRecord(rule, record)">
                <span class="feather-icon icon-check"></span>
              </span>
              <input type="text" :value="record" readonly class="form-control target">
            </div>
          </template>
        </div>
        <div class="rule-line">
          <span class="list-style">
            <span class="link add" @click="addRule">
              <span class="feather-icon icon-plus-circle"></span>
            </span>
          </span>
        </div>
      </div>
    </div>
  </terminal-pane>
</template>

<script>
import { ipcRenderer } from 'electron'
import { reactive, toRefs, computed, toRaw, watchEffect } from 'vue'
import { isEqual, cloneDeep } from 'lodash-es'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import SwitchControl from '../../components/basic/switch-control.vue'
import { useSystemProxyStatus, useProxyRules } from './hooks'

export default {
  name: 'ProxyPane',
  components: {
    'terminal-pane': TerminalPane,
    'switch-control': SwitchControl,
  },
  setup() {
    const state = reactive({
      supportsSystemProxy: process.platform === 'darwin',
      isSystemProxyEnabled: useSystemProxyStatus(),
      rules: useProxyRules(),
      table: [],
      recallingRule: null,
    })

    state.isChanged = computed(() => {
      return !isEqual(state.rules, state.table)
    })

    function openProxyRules() {
      ipcRenderer.invoke('open-user-file', 'proxy-rules.json', true)
    }

    function revert() {
      state.table = cloneDeep(state.rules)
    }

    function confirm() {
      state.rules = state.table
    }

    function removeIndex(arr, index) {
      arr.splice(index, 1)
    }

    function addRule() {
      state.table.push({
        context: [''],
        proxy: {
          target: '',
        },
      })
    }

    function isRecalling(rule) {
      return toRaw(state.recallingRule) === toRaw(rule)
    }

    function recall(rule) {
      if (!rule.proxy.records) return
      state.recallingRule = isRecalling(rule) ? null : rule
    }

    function useRecord(rule, record) {
      rule.proxy.target = record
      state.recallingRule = null
    }

    watchEffect(revert)

    return {
      ...toRefs(state),
      openProxyRules,
      revert,
      confirm,
      removeIndex,
      addRule,
      isRecalling,
      recall,
      useRecord,
    }
  },
}
</script>

<style>
.proxy-pane .form-action {
  margin: 0;
}
.proxy-pane .revert {
  color: var(--design-red);
}
.proxy-pane .confirm {
  color: var(--design-green);
}
.proxy-pane .revert.disabled,
.proxy-pane .confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
.proxy-table .rule-line {
  display: flex;
  align-items: center;
}
.proxy-table .list-style {
  width: 24px;
  text-align: center;
}
.proxy-table .link {
  width: 24px;
  text-align: center;
  transition: opacity 0.2s, color 0.2s;
}
.proxy-table .proxy-to {
  width: 36px;
  text-align: center;
  transition: transform 0.2s, color 0.2s;
}
.proxy-table .proxy-to.active {
  color: var(--design-yellow);
  transform: rotate(90deg);
}
.proxy-table .proxy-to.valid {
  color: var(--design-yellow);
  cursor: pointer;
}
.proxy-table .rewriting {
  width: 36px;
  text-align: center;
  color: var(--design-yellow);
  opacity: 0.5;
}
.proxy-table .link.remove {
  color: var(--design-red);
}
.proxy-table .link.remove + .form-control {
  margin-left: 4px;
}
.proxy-table .form-control {
  width: 320px;
}
.proxy-table .form-control.target {
  width: 288px;
}
.proxy-table .rule-label {
  width: 80px;
}
.proxy-table .record-action.confirm {
  width: 36px;
}
</style>
