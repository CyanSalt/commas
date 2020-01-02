import {cloneDeep} from 'lodash'

export function normalizeRules(rules) {
  return rules.reduce((collection, original) => {
    const rule = {...original}
    if (!rule.proxy || !rule.context) {
      return collection
    }
    if (!rule.proxy.target) {
      rule.proxy = {target: rule.proxy}
    }
    collection.push(rule)
    return collection
  }, [])
}

function parseRuleEntry(expression) {
  const regexp = expression.match(/^s\/(.+)\/([a-z]+)?$/)
  if (regexp) {
    let pattern
    try {
      pattern = new RegExp(regexp[1], regexp[2])
    } catch {
      return null
    }
    return {pattern}
  }
  let matches = {}
  let url = expression
  if (expression.startsWith('//')) {
    matches.host = true
    url = 'http:' + url
  } else if (expression.startsWith('/')) {
    url = 'http://localhost' + url
  } else if (expression.indexOf('://') !== -1) {
    matches.host = true
    matches.protocol = true
  } else {
    matches.host = true
    url = 'http://' + url
  }
  try {
    url = new URL(url)
  } catch {
    return null
  }
  return {url, matches}
}

export function parseProxyRules(rules) {
  rules = normalizeRules(rules)
  return rules.reduce((collection, original) => {
    const rule = {...original}
    const entries = rule.context.reduce((entries, expression) => {
      const entry = parseRuleEntry(expression)
      if (entry) entries.push(entry)
      return entries
    }, [])
    if (entries.length) {
      rule.entries = entries
      collection.push(rule)
    }
    return collection
  }, [])
}

export function matchProxyRule(rules, url) {
  url = new URL(url)
  const rule = rules.find(rule => {
    return rule.entries.some(entry => {
      if (entry.pattern) return entry.pattern.test(url.href)
      if (entry.matches.host && entry.url.host !== url.host) return false
      if (entry.matches.protocol && entry.url.protocol !== url.protocol) return false
      if (entry.url.search && ![...entry.url.searchParams].every(
        (key, value) => url.searchParams.get(key) === value,
      )) return false
      return url.pathname.startsWith(entry.url.pathname)
    })
  })
  return rule ? rule.proxy : {target: url.origin}
}

export function trackRuleTargets(rules) {
  rules = normalizeRules(rules)
  rules = cloneDeep(rules)
  rules.forEach(({proxy}) => {
    proxy._target = proxy.target
  })
  return rules
}

export function resolveRuleTargets(rules) {
  rules = cloneDeep(rules)
  rules.forEach(({proxy}) => {
    if (proxy._target) {
      if (proxy.target !== proxy._target) {
        if (!proxy.records) proxy.records = []
        if (!proxy.records.includes(proxy._target)) {
          proxy.records.push(proxy._target)
        }
      }
      delete proxy._target
    }
    if (proxy.records && !proxy.records.length) {
      delete proxy.records
    }
  })
  return rules
}
