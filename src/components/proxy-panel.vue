<template>
  <internal-panel class="proxy-panel">
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
        <div v-for="(rule, index) of table" :key="index" class="proxy-rule">
          <template v-if="rule.context">
            <div v-for="(path, index) in rule.context" :key="index" class="rule-line">
              <span class="list-style">
                <span v-if="index === 0" class="feather-icon icon-chevron-down"></span>
              </span>
              <span class="link remove" @click="$delete(rule.context, index)">
                <span class="feather-icon icon-minus"></span>
              </span>
              <input type="text" v-model="rule.context[index]" class="form-control">
            </div>
          </template>
          <div class="rule-line">
            <span class="list-style"></span>
            <span class="link remove" @click="$delete(table, index)">
              <span class="feather-icon icon-minus"></span>
            </span>
            <span class="link add" @click="addContext(rule)">
              <span class="feather-icon icon-plus"></span>
            </span>
            <span class="proxy-to">
              <span class="feather-icon icon-arrow-right"></span>
            </span>
            <input type="text" v-model="rule.proxy.target"
              :placeholder="i18n('Proxy to...#!25')" class="form-control target">
          </div>
        </div>
        <div class="rule-line">
          <span class="link" @click="addRule">
            <span class="feather-icon icon-plus-square"></span>
          </span>
        </div>
      </div>
    </div>
  </internal-panel>
</template>

<script>
import InternalPanel from './internal-panel'
import {mapState} from 'vuex'
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
  opacity: 0.5;
}
.proxy-panel .link {
  width: 24px;
  text-align: center;
  transition: opacity 0.2s, color 0.2s;
}
.proxy-panel .proxy-to {
  width: 36px;
  text-align: center;
}
.proxy-panel .link.remove {
  margin-right: 4px;
  color: var(--design-red);
}
.proxy-panel .form-control {
  width: 320px;
}
.proxy-panel .form-control.target {
  width: 260px;
}
.proxy-panel .rule-label {
  width: 80px;
}
</style>
