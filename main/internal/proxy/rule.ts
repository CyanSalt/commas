import { EventEmitter } from 'events'
import cloneDeep from 'lodash/cloneDeep'
import memoize from 'lodash/memoize'
import { broadcast } from '../../lib/frame'
import { userData } from '../../utils/directory'
import type { ProxyRule } from './utils'
import { getValidRules } from './utils'

const getProxyRulesEvents = memoize(() => {
  return new EventEmitter()
})

function loadProxyRules() {
  return userData.fetch<ProxyRule[]>('proxy-rules.json')
}

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

const getRawProxyRules = memoize(() => {
  userData.watch('proxy-rules.json', () => {
    getRawProxyRules.cache.set(undefined, loadProxyRules())
    updateProxyRules()
  })
  return loadProxyRules()
})

async function getProxyRules() {
  const result = await getRawProxyRules()
  const rules = result?.data ?? []
  return getValidRules(rules).map(rule => {
    rule.proxy._target = rule.proxy.target
    rule._enabled = !rule.disabled
    return rule
  })
}

async function updateProxyRules() {
  const rules = await getProxyRules()
  broadcast('proxy-rules-updated', rules)
  const events = getProxyRulesEvents()
  events.emit('updated', rules)
}

async function setProxyRules(rules: ProxyRule[]) {
  const result = await getRawProxyRules()
  return userData.update('proxy-rules.json', {
    data: resolveRuleTargets(rules),
    writer: result?.writer,
  })
}

export {
  getProxyRulesEvents,
  getProxyRules,
  setProxyRules,
}
