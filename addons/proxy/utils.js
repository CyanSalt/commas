const cloneDeep = require('lodash/cloneDeep')
const { createPattern } = require('../../main/utils/helper')

/**
 * @typedef {import('http').ClientRequest} ClientRequest
 * @typedef {import('http').ServerResponse} ServerResponse
 * @typedef {import('http-proxy').ServerOptions} ServerOptions
 *
 * @typedef RewritingRule
 * @property {'request'|'response'} when
 * @property {'header'|'body'} type
 * @property {string} content
 * @property {string} [name]
 * @property {string} [from]
 *
 * @typedef ProxyRuleEntry
 * @property {URL} url
 * @property {RegExp} [pattern]
 * @property {{protocol?: boolean, host?: boolean}} matches
 *
 * @typedef ProxyRule
 * @property {ServerOptions} proxy
 * @property {string[]} context
 * @property {ProxyRuleEntry[]} entries
 */

/**
 * @param {ProxyRule[]} rules
 */
function getValidRules(rules) {
  return cloneDeep(rules.filter(rule => rule.proxy && rule.context))
}

/**
 * @param {string} expression
 * @returns {ProxyRuleEntry}
 */
function parseRuleEntry(expression) {
  const pattern = createPattern(expression)
  if (pattern) return { pattern }
  let matches = {}
  let url = expression
  if (expression.startsWith('//')) {
    matches.host = true
    url = 'http:' + url
  } else if (expression.startsWith('/')) {
    url = 'http://localhost' + url
  } else if (expression.includes('://')) {
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
  return { url, matches }
}

/**
 * @param {ProxyRule[]} rules
 * @returns {ProxyRule[]}
 */
function extractProxyRules(rules) {
  return getValidRules(rules).reduce((collection, rule) => {
    const entries = rule.context.reduce((allEntries, expression) => {
      const entry = parseRuleEntry(expression)
      if (entry) allEntries.push(entry)
      return allEntries
    }, [])
    if (entries.length) {
      rule.entries = entries
      collection.push(rule)
    }
    return collection
  }, [])
}

/**
 * @param {ProxyRule[]} rules
 * @param {string} url
 */
function getMatchedProxyRules(rules, url) {
  return rules.filter(rule => !rule.disabled && rule.entries.some(entry => {
    if (entry.pattern) return entry.pattern.test(url.href)
    if (entry.matches.host && entry.url.host !== url.host) return false
    if (entry.matches.protocol && entry.url.protocol !== url.protocol) return false
    if (entry.url.search && ![...entry.url.searchParams].every(
      (key, value) => url.searchParams.get(key) === value,
    )) return false
    return url.pathname.startsWith(entry.url.pathname)
  }))
}

/**
 * @param {ProxyRule[]} rules
 * @param {string} url
 * @returns {ServerOptions}
 */
function getProxyServerOptions(rules, url) {
  url = new URL(url)
  const matched = getMatchedProxyRules(rules, url)
  const rule = matched.find(item => item.proxy.target)
  return rule ? rule.proxy : { target: url.origin }
}

/**
 * @param {ProxyRule[]} rules
 * @param {string} url
 * @returns {RewritingRule[]}
 */
function getProxyRewritingRules(rules, url) {
  url = new URL(url)
  const matched = getMatchedProxyRules(rules, url)
  return [].concat(...matched.map(rule => rule.proxy.rewrite).filter(Boolean))
}

/**
 * @param {'request'|'response'} when
 * @param {ClientRequest|ServerResponse} target
 * @param {RewritingRule} rule
 * @returns {number|string}
 */
function getRewritingContent(when, target, rule) {
  switch (rule.type) {
    case 'header':
      if (when === 'request') {
        if (rule.name === ':method') return target.method
        if (rule.name === ':path') return target.path
      } else if (when === 'response') {
        if (rule.name === ':status') return target.statusCode
      }
      return target.getHeader(rule.name) || ''
    default:
      return ''
  }
}

/**
 * @param {'request'|'response'} when
 * @param {ClientRequest|ServerResponse} target
 * @param {RewritingRule} rule
 */
function rewriteContent(when, target, rule, content) {
  switch (rule.type) {
    case 'header':
      if (content === null) {
        target.removeHeader(rule.name)
        return
      }
      if (when === 'request') {
        if (rule.name === ':method') target.method = content
        if (rule.name === ':path') target.path = content
      } else if (when === 'response') {
        if (rule.name === ':status') target.writeHead(content)
      }
      target.setHeader(rule.name, content)
      return
    case 'body':
      target.end(content)
      return
  }
}

/**
 * @param {'request'|'response'} when
 * @param {ClientRequest|ServerResponse} target
 * @param {RewritingRule[]} rule
 */
function rewriteProxy(when, target, rules) {
  rules = rules.filter(item => item.when === when)
  for (const rule of rules) {
    const original = getRewritingContent(when, target, rule)
    let matched = true
    let content = rule.content
    if (rule.from) {
      const pattern = createPattern(rule.from)
      if (!pattern) {
        matched = original === rule.from
      } else {
        matched = pattern.test(original)
        if (matched && content !== null) {
          content = original.replace(pattern, content)
        }
      }
    }
    if (matched) {
      rewriteContent(when, target, rule, content)
    }
  }
}

module.exports = {
  getValidRules,
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
}
