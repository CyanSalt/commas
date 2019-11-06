<template>
  <internal-panel class="proxy-panel">
    <h2 class="group-title">{{ i18n('Proxy Rules#!23') }} (beta)</h2>
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
        <div v-for="(rule, index) of table" :key="index" class="proxy-rule">
          <div class="rule-line">
            <span class="list-style">
              <span class="feather-icon icon-chevron-down"></span>
            </span>
            <span class="link remove" @click="$delete(table, index)">
              <span class="feather-icon icon-minus"></span>
            </span>
            <input type="text" v-model="rule.proxy.target"
              :placeholder="i18n('Proxy to...#!25')" class="form-control target">
          </div>
          <div v-if="typeof rule.host === 'string'" class="rule-line">
            <span class="list-style"></span>
            <span class="link remove" @click="$delete(rule, 'host')">
              <span class="feather-icon icon-minus"></span>
            </span>
            <label class="rule-label" v-i18n>Host#!27</label>
            <input type="text" v-model="rule.host" class="form-control">
          </div>
          <template v-if="rule.context">
            <div v-for="(path, index) in rule.context" :key="index" class="rule-line">
              <span class="list-style"></span>
              <span class="link remove" @click="$delete(rule.context, index)">
                <span class="feather-icon icon-minus"></span>
              </span>
            <label class="rule-label" v-i18n>Path#!28</label>
              <input type="text" v-model="rule.context[index]" class="form-control">
            </div>
          </template>
          <div v-if="typeof rule.pattern === 'string'" class="rule-line">
            <span class="list-style"></span>
            <span class="link remove" @click="$delete(rule, 'pattern')">
              <span class="feather-icon icon-minus"></span>
            </span>
            <label class="rule-label" v-i18n>Pattern#!29</label>
            <input type="text" v-model="rule.pattern"
              :placeholder="i18n('Regular Expression...#!26')" class="form-control">
          </div>
          <div class="rule-line">
            <span class="list-style"></span>
            <span v-if="typeof rule.host !== 'string'" class="link add"
              v-i18n @click="$set(rule, 'host', '')">Host#!27</span>
            <span class="link add"
              v-i18n @click="addContext(rule)">Path#!28</span>
            <span v-if="typeof rule.pattern !== 'string'" class="link add"
              v-i18n @click="$set(rule, 'pattern', '')">Pattern#!29</span>
          </div>
        </div>
        <div class="rule-line">
          <span class="link" @click="addRule">
            <span class="feather-icon icon-plus"></span>
          </span>
        </div>
      </div>
    </div>
  </internal-panel>
</template>

<script>
import InternalPanel from './internal-panel'
import {mapState, mapActions} from 'vuex'
import {cloneDeep, isEqual} from 'lodash'
import {normalizeRules} from '@/utils/proxy'

export default {
  name: 'ProxyPanel',
  components: {
    'internal-panel': InternalPanel,
  },
  data() {
    return {
      platform: process.platform,
      original: [],
      table: [],
    }
  },
  computed: {
    ...mapState('proxy', ['rules']),
    changed() {
      return !isEqual(this.original, this.table)
    },
  },
  created() {
    this.original = normalizeRules(this.rules)
    this.revert()
  },
  methods: {
    ...mapActions('command', ['exec']),
    addRule() {
      this.table.push({proxy: {target: ''}})
    },
    addContext(rule) {
      if (!rule.context) this.$set(rule, 'context', [''])
      else rule.context.push('')
    },
    revert() {
      this.table = cloneDeep(this.original)
    },
    confirm() {
      this.$store.dispatch('proxy/save', this.table)
      this.original = cloneDeep(this.table)
    },
  },
}
</script>

<style>
.proxy-panel .revert {
  color: var(--design-red);
  opacity: 1;
}
.proxy-panel .confirm {
  color: var(--design-green);
  opacity: 1;
}
.proxy-panel .revert.disabled,
.proxy-panel .confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
.proxy-panel .rule-line {
  display: flex;
  align-items: center;
}
.proxy-panel .list-style {
  width: 24px;
  text-align: center;
  opacity: 0.25;
}
.proxy-panel .link {
  width: 24px;
  text-align: center;
  transition: opacity 0.2s, color 0.2s;
}
.proxy-panel .link.remove {
  margin-right: 4px;
  color: var(--design-red);
}
.proxy-panel .link.add {
  margin-right: 14px;
  width: auto;
}
.proxy-panel .form-control {
  width: 180px;
}
.proxy-panel .form-control.target {
  width: 260px;
}
.proxy-panel .rule-label {
  width: 80px;
}
</style>
