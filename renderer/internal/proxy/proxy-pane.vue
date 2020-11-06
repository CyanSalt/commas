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
        <span :class="['link form-action toggle-all', { collapsed: collapsedRuleIndexes.length > 0 }]" @click="toggleAll">
          <span class="feather-icon icon-chevrons-down"></span>
        </span>
        <span :class="['link form-action revert', { disabled: !isChanged }]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', { disabled: !isChanged }]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <div class="proxy-table">
        <div v-for="(rule, row) in table" :key="row" class="proxy-rule">
          <div :class="['rule-summary', 'rule-line', { collapsed: collapsedRuleIndexes.includes(row), disabled: !rule._enabled }]">
            <span class="link tree-node" @click="toggleRule(row)">
              <span class="feather-icon icon-chevron-down"></span>
            </span>
            <label class="rule-checkbox">
              <input v-model="rule._enabled" type="checkbox">
            </label>
            <input
              v-model="rule.title"
              :placeholder="getRulePlaceholder(row)"
              class="rule-title immersive-control"
            >
            <span class="link duplicate" @click="duplicateRule(row)">
              <span class="feather-icon icon-copy"></span>
            </span>
            <span class="link remove" @click="removeRule(row)">
              <span class="feather-icon icon-minus-circle"></span>
            </span>
          </div>
          <div v-show="!collapsedRuleIndexes.includes(row)" class="rule-detail">
            <div v-for="(entry, index) in rule.context" :key="`entry:${index}`" class="rule-line">
              <span class="link remove" @click="removeContext(rule, index)">
                <span class="feather-icon icon-minus"></span>
              </span>
              <input v-model="rule.context[index]" type="text" class="form-control">
            </div>
            <div class="rule-line">
              <span class="link add" @click="addContext(rule)">
                <span class="feather-icon icon-plus"></span>
              </span>
              <span
                :class="['link', 'proxy-to', { active: isRecalling(rule), valid: rule.proxy.records }]"
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
              <span v-if="rule.proxy.rewrite" class="link rewriting">
                <span class="feather-icon icon-activity"></span>
              </span>
            </div>
            <template v-if="isRecalling(rule)">
              <div
                v-for="(record, index) in rule.proxy.records"
                :key="`record:${index}`"
                class="rule-line"
              >
                <span class="link record-action remove" @click="removeRecord(rule, index)">
                  <span class="feather-icon icon-x"></span>
                </span>
                <span class="link record-action confirm" @click="useRecord(rule, record)">
                  <span class="feather-icon icon-check"></span>
                </span>
                <input type="text" :value="record" readonly class="form-control target">
              </div>
            </template>
          </div>
        </div>
        <div class="rule-line">
          <span class="link add" @click="addRule">
            <span class="feather-icon icon-plus-circle"></span>
          </span>
        </div>
      </div>
    </div>
  </terminal-pane>
</template>

<script>
import { ipcRenderer } from 'electron'
import { isEqual, cloneDeep } from 'lodash-es'
import { reactive, toRefs, computed, toRaw, watchEffect } from 'vue'
import SwitchControl from '../../components/basic/switch-control.vue'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import { useSystemProxyStatus, useProxyRules } from './hooks.mjs'

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
      collapsedRuleIndexes: [],
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

    watchEffect(revert)

    function addRule() {
      state.table.push({
        context: [''],
        proxy: {
          target: '',
        },
      })
    }

    function removeRule(index) {
      state.table.splice(index, 1)
      const indexOfIndex = state.collapsedRuleIndexes.indexOf(index)
      if (indexOfIndex !== -1) {
        state.collapsedRuleIndexes.splice(indexOfIndex, 1)
      }
      state.collapsedRuleIndexes.forEach((value, indexOfValue) => {
        if (value > index) state.collapsedRuleIndexes[indexOfValue] -= 1
      })
    }

    function removeContext(rule, index) {
      rule.context.splice(index, 1)
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

    function removeRecord(rule, index) {
      rule.proxy.records.splice(index, 1)
    }

    function toggleRule(index) {
      const indexOfIndex = state.collapsedRuleIndexes.indexOf(index)
      if (indexOfIndex === -1) {
        state.collapsedRuleIndexes.push(index)
      } else {
        state.collapsedRuleIndexes.splice(indexOfIndex, 1)
      }
    }

    function toggleAll() {
      if (state.collapsedRuleIndexes.length) {
        state.collapsedRuleIndexes = []
      } else {
        state.collapsedRuleIndexes = [...state.table.keys()]
      }
    }

    function getRulePlaceholder(index) {
      const rule = state.table[index]
      let identifier = `#${index + 1}`
      const context = rule.context.filter(Boolean)
      if (context.length) {
        identifier += ` ${context[0]}${context.length > 1 ? ` (+${context.length - 1})` : ''}`
      }
      return identifier
    }

    function duplicateRule(index) {
      const rule = state.table[index]
      state.table.splice(index, 0, cloneDeep(rule))
      state.collapsedRuleIndexes.forEach((value, indexOfValue) => {
        if (value > index) state.collapsedRuleIndexes[indexOfValue] += 1
      })
    }

    return {
      ...toRefs(state),
      openProxyRules,
      revert,
      confirm,
      addRule,
      removeRule,
      removeContext,
      isRecalling,
      recall,
      useRecord,
      removeRecord,
      toggleRule,
      toggleAll,
      getRulePlaceholder,
      duplicateRule,
    }
  },
}
</script>

<style>
.proxy-pane .form-action {
  margin: 0;
}
.proxy-pane .toggle-all.collapsed {
  opacity: 1;
  transform: rotate(-90deg);
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
.proxy-table .link {
  width: 24px;
  text-align: center;
}
.proxy-table .proxy-to {
  width: 36px;
  opacity: 1;
  cursor: default;
}
.proxy-table .proxy-to.active {
  color: var(--design-yellow);
  transform: rotate(90deg);
}
.proxy-table .proxy-to.valid {
  color: var(--design-yellow);
  cursor: pointer;
}
.proxy-table .rule-line .link:first-child {
  margin-right: 4px;
}
.proxy-table .rewriting {
  color: var(--design-yellow);
  opacity: 1;
  cursor: default;
}
.proxy-table .link.remove:hover {
  color: var(--design-red);
}
.proxy-table .form-control {
  margin-right: 4px;
  box-sizing: border-box;
  width: 320px;
}
.proxy-table .form-control.target {
  width: 284px; /* 320 - 36px */
}
.proxy-table .record-action.confirm {
  width: 36px;
}
.proxy-table .link.tree-node {
  opacity: 1;
  transition: transform 0.2s;
}
.proxy-table .rule-summary.collapsed .link.tree-node {
  transform: rotate(-90deg);
}
.proxy-table .rule-summary.disabled .rule-title,
.proxy-table .rule-summary.disabled .rule-title::placeholder {
  text-decoration: line-through;
}
.proxy-table .rule-checkbox {
  margin-top: -3px;
  width: 36px;
  display: inline-flex;
  justify-content: center;
}
.proxy-table .rule-title {
  margin-right: 4px;
  width: 284px;
  text-overflow: ellipsis;
}
</style>
