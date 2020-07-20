const { ipcMain } = require('electron')
const EventEmitter = require('events')
const memoize = require('lodash/memoize')
const cloneDeep = require('lodash/cloneDeep')
const { userData } = require('../../main/utils/directory')
const { broadcast } = require('../../main/lib/frame')
const { getValidRules } = require('./utils')

/**
 * @typedef {import('./utils').ProxyRule} ProxyRule
 */

const getProxyRulesEvents = memoize(() => {
  return new EventEmitter()
})

function loadProxyRules() {
  return userData.fetch('proxy-rules.json')
}

/**
 * @param {ProxyRule[]} rules
 */
function resolveRuleTargets(rules) {
  rules = cloneDeep(rules)
  rules.forEach(({ proxy }) => {
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
      delete proxy._target
    }
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
  const rules = result && result.data
  return getValidRules(rules).map(rule => {
    rule.proxy._target = rule.proxy.target
    return rule
  })
}

async function updateProxyRules() {
  const rules = await getProxyRules()
  broadcast('proxy-rules-updated', rules)
  const events = getProxyRulesEvents()
  events.emit('updated', rules)
}

function handleProxyRulesMessages() {
  ipcMain.handle('get-proxy-rules', () => {
    return getProxyRules()
  })
  ipcMain.handle('set-proxy-rules', async (event, rules) => {
    const result = await getRawProxyRules()
    return userData.update('proxy-rules.json', {
      data: resolveRuleTargets(rules),
      writer: result && result.writer,
    })
  })
}

module.exports = {
  handleProxyRulesMessages,
  getProxyRulesEvents,
  getProxyRules,
}
