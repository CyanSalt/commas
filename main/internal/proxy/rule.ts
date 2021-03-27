import cloneDeep from 'lodash/cloneDeep'
import { userData } from '../../utils/directory'
import type { ProxyRule } from './utils'
import { getValidRules } from './utils'

function resolveRuleTargets(rules: ProxyRule[]) {
  rules = cloneDeep(rules)
  rules.forEach(rule => {
    const { proxy } = rule
    if (proxy._target) {
      if (proxy.target !== proxy._target) {
        if (!proxy.records) {
          proxy.records = []
        } else {
          // Remove old record if exists
          const index = proxy.records.indexOf(proxy._target)
          if (index !== -1) proxy.records.splice(index, 1)
        }
        // Keep the recent record top
        proxy.records.unshift(proxy._target)
      }
    }
    delete proxy._target
    if (proxy.records) {
      // Remove current target
      if (proxy.records.length) {
        const index = proxy.records.indexOf(proxy.target)
        if (index !== -1) proxy.records.splice(index, 1)
      }
      // Delete empty record array
      if (!proxy.records.length) {
        delete proxy.records
      }
    }
    if (!rule.title) {
      delete rule.title
    }
    if (rule._enabled) {
      delete rule.disabled
    } else {
      rule.disabled = true
    }
    delete rule._enabled
  })
  return rules
}

const proxyRulesRef = userData.use<ProxyRule[], ProxyRule[]>('proxy-rules.json', {
  get(value) {
    return getValidRules(value ?? []).map(rule => {
      rule.proxy._target = rule.proxy.target
      rule._enabled = !rule.disabled
      return rule
    })
  },
  set(value) {
    return resolveRuleTargets(value)
  },
})

function useProxyRules() {
  return proxyRulesRef
}

export {
  useProxyRules,
}
