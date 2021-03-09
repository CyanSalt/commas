<template>
  <terminal-pane class="proxy-pane">
    <h2 v-i18n class="group-title">General#!preference.2</h2>
    <div class="group">
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.3</label>
        <switch-control v-model="isSystemProxyEnabled"></switch-control>
      </div>
      <span class="link" @click="openProxyRules">
        <span v-i18n="{ F: 'proxy-rules.json' }">Edit %F#!preference.8</span>
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
        <sortable-list
          v-slot="{ value: rule, index: row }"
          :value="table"
          class="rule-list"
          @change="sortRules"
        >
          <div class="proxy-rule">
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
              <object-editor v-model="rule.context">
                <template #extra>
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
                </template>
              </object-editor>
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
        </sortable-list>
        <div class="rule-line">
          <span class="link add" @click="addRule">
            <span class="feather-icon icon-plus-circle"></span>
          </span>
        </div>
      </div>
    </div>
  </terminal-pane>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { isEqual, cloneDeep } from 'lodash-es'
import { reactive, toRefs, computed, toRaw, watchEffect } from 'vue'
import ObjectEditor from '../../components/basic/object-editor.vue'
import SortableList from '../../components/basic/sortable-list.vue'
import SwitchControl from '../../components/basic/switch-control.vue'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import type { ProxyRule } from './hooks'
import { useSystemProxyStatus, useProxyRules } from './hooks'

export default {
  name: 'proxy-pane',
  components: {
    'terminal-pane': TerminalPane,
    'switch-control': SwitchControl,
    'sortable-list': SortableList,
    'object-editor': ObjectEditor,
  },
  setup() {
    const state = reactive({
      supportsSystemProxy: process.platform === 'darwin',
      isSystemProxyEnabled: useSystemProxyStatus(),
      rules: useProxyRules(),
      table: [] as ProxyRule[],
      recallingRule: null as ProxyRule | null,
      collapsedRuleIndexes: [] as number[],
    })

    const isChangedRef = computed(() => {
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
        _enabled: true,
        title: '',
        context: [''],
        proxy: {
          target: '',
        },
      })
    }

    function removeRule(index: number) {
      state.table.splice(index, 1)
      const indexOfIndex = state.collapsedRuleIndexes.indexOf(index)
      if (indexOfIndex !== -1) {
        state.collapsedRuleIndexes.splice(indexOfIndex, 1)
      }
      state.collapsedRuleIndexes.forEach((value, indexOfValue) => {
        if (value > index) state.collapsedRuleIndexes[indexOfValue] -= 1
      })
    }

    function isRecalling(rule: ProxyRule) {
      return toRaw(state.recallingRule) === toRaw(rule)
    }

    function recall(rule: ProxyRule) {
      if (!rule.proxy.records) return
      state.recallingRule = isRecalling(rule) ? null : rule
    }

    function useRecord(rule: ProxyRule, record: string) {
      rule.proxy.target = record
      state.recallingRule = null
    }

    function removeRecord(rule: ProxyRule, index: number) {
      if (!rule.proxy.records) return
      rule.proxy.records.splice(index, 1)
    }

    function toggleRule(index: number) {
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

    function getRulePlaceholder(index: number) {
      const rule = state.table[index]
      let identifier = `#${index + 1}`
      const context = rule.context.filter(Boolean)
      if (context.length) {
        identifier += ` ${context[0]}${context.length > 1 ? ` (+${context.length - 1})` : ''}`
      }
      return identifier
    }

    function duplicateRule(index: number) {
      const rule = state.table[index]
      state.table.splice(index, 0, cloneDeep(rule))
      state.collapsedRuleIndexes.forEach((value, indexOfValue) => {
        if (value > index) state.collapsedRuleIndexes[indexOfValue] += 1
      })
    }

    function sortRules(from: number, to: number) {
      const rule = state.table[from]
      if (from < to) {
        state.table.splice(to + 1, 0, rule)
        state.table.splice(from, 1)
      } else {
        state.table.splice(from, 1)
        state.table.splice(to, 0, rule)
      }
    }

    return {
      ...toRefs(state),
      isChanged: isChangedRef,
      openProxyRules,
      revert,
      confirm,
      addRule,
      removeRule,
      isRecalling,
      recall,
      useRecord,
      removeRecord,
      toggleRule,
      toggleAll,
      getRulePlaceholder,
      duplicateRule,
      sortRules,
    }
  },
}
</script>

<style lang="scss" scoped>
.form-action {
  margin: 0;
}
.toggle-all.collapsed {
  opacity: 1;
  transform: rotate(-90deg);
}
.revert {
  color: var(--design-red);
}
.confirm {
  color: var(--design-green);
}
.revert.disabled,
.confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
.rule-line {
  display: flex;
  align-items: center;
  .link:first-child {
    margin-right: 4px;
  }
}
.proxy-table .link {
  width: 24px;
  text-align: center;
}
.proxy-table .proxy-to {
  width: 36px;
  opacity: 1;
  cursor: default;
  &.active {
    color: var(--design-yellow);
    transform: rotate(90deg);
  }
  &.valid {
    color: var(--design-yellow);
    cursor: pointer;
  }
}
.proxy-table :deep(input.form-control) {
  margin-right: 4px;
  box-sizing: border-box;
  width: 320px;
  &.target {
    width: 320 - 36px;
  }
}
.tree-node {
  opacity: 1;
  transition: transform 0.2s;
  .rule-summary.collapsed & {
    transform: rotate(-90deg);
  }
}
.rewriting {
  color: var(--design-yellow);
  opacity: 1;
  cursor: default;
}
.record-action.confirm {
  width: 36px;
}
.rule-checkbox {
  margin-top: -3px;
  width: 36px;
  display: inline-flex;
  justify-content: center;
}
.rule-title {
  margin-right: 4px;
  width: 284px;
  text-overflow: ellipsis;
  .rule-summary.disabled &,
  .rule-summary.disabled &::placeholder {
    text-decoration: line-through;
  }
}
</style>
