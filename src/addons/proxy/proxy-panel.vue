<template>
  <internal-panel class="proxy-panel">
    <h2 class="group-title" v-i18n>General#!8</h2>
    <div class="group">
      <div v-if="platform === 'darwin'" class="form-line">
        <label class="form-label" v-i18n>Enable system proxy#!21</label>
        <switch-control :checked="globe" @change="toggleGlobal"></switch-control>
      </div>
      <span class="link" @click="openFile">
        <span v-i18n="{F: 'proxy-rules.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Proxy Rules#!23</h2>
    <div class="group">
      <div class="form-line">
        <span :class="['link form-action revert', {disabled: !changed}]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', {disabled: !changed}]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <div class="proxy-table">
        <div v-for="(rule, row) of table" :key="row" class="proxy-rule">
          <div v-for="(entry, index) in rule.context" :key="`entry:${index}`" class="rule-line">
            <span class="list-style">
              <span v-if="index === 0" class="link remove" @click="$delete(table, row)">
                <span class="feather-icon icon-minus-circle"></span>
              </span>
            </span>
            <span class="link remove" @click="$delete(rule.context, index)">
              <span class="feather-icon icon-minus"></span>
            </span>
            <input type="text" v-model="rule.context[index]" class="form-control">
          </div>
          <div class="rule-line">
            <span class="list-style">
              <span v-if="!rule.context.length" class="link remove" @click="$delete(table, row)">
                <span class="feather-icon icon-minus-circle"></span>
              </span>
            </span>
            <span class="link add" @click="addContext(rule)">
              <span class="feather-icon icon-plus"></span>
            </span>
            <span :class="['proxy-to', {active: recalling === rule, valid: rule.proxy.records}]"
              @click="recall(rule)">
              <span class="feather-icon icon-corner-down-right"></span>
            </span>
            <input type="text" v-model="rule.proxy.target" :readonly="recalling === rule"
              v-i18n placeholder="Proxy to...#!25" class="form-control target">
          </div>
          <template v-if="recalling === rule">
            <div v-for="(record, index) in rule.proxy.records"
              :key="`record:${index}`" class="rule-line">
              <span class="list-style"></span>
              <span class="link record-action remove" @click="$delete(rule.proxy.records, index)">
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
  </internal-panel>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import {cloneDeep, isEqual} from 'lodash'
import {trackRuleTargets, resolveRuleTargets} from './utils'
import hooks from '@/hooks'

export default {
  name: 'ProxyPanel',
  components: {
    'internal-panel': hooks.workspace.components.InternalPanel,
    'switch-control': hooks.workspace.components.SwitchControl,
  },
  data() {
    return {
      platform: process.platform,
      original: [],
      table: [],
      recalling: null,
    }
  },
  computed: {
    ...mapState('proxy', ['rules', 'globe']),
    changed() {
      return !isEqual(this.original, this.table)
    },
  },
  watch: {
    rules: {
      handler(value, oldValue) {
        if (value === oldValue) return
        if (!this.changed) this.apply(value)
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('proxy', ['toggleGlobal']),
    exec: hooks.command.exec,
    apply(rules) {
      this.original = trackRuleTargets(rules)
      this.revert()
    },
    addRule() {
      this.table.push({
        context: [''],
        proxy: {target: ''},
      })
    },
    addContext(rule) {
      rule.context.push('')
    },
    recall(rule) {
      if (!rule.proxy.records) return
      this.recalling = this.recalling === rule ? null : rule
    },
    useRecord(rule, record) {
      rule.proxy.target = record
      this.recalling = null
    },
    revert() {
      this.table = cloneDeep(this.original)
    },
    confirm() {
      const latest = resolveRuleTargets(this.table)
      this.$store.dispatch('proxy/save', latest)
      this.apply(latest)
    },
    openFile() {
      hooks.shell.openUserFile('proxy-rules.json', 'examples/proxy-rules.json')
    },
  },
}
</script>

<style>
.proxy-panel .form-action {
  margin: 0;
}
.proxy-panel .revert {
  color: var(--design-red);
}
.proxy-panel .confirm {
  color: var(--design-green);
}
.proxy-panel .revert.disabled,
.proxy-panel .confirm.disabled {
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
