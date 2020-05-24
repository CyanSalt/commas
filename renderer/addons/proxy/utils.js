import { cloneDeep } from 'lodash'
import hooks from '@commas/hooks'

/**
 * @typedef {import('http').ClientRequest} Request
 * @typedef {import('http').ServerResponse} Response
 *
 * @typedef ProxyRewriteRule
 * @property {'request'|'response'} when
 * @property {'header'|'body'} type
 * @property {string} content
 * @property {string} [name]
 * @property {string} [from]
 *
 * @typedef ProxyOptions
 * @property {string} target
 * @property {string} [_target]
 * @property {string[]} [records]
 * @property {ProxyRewriteRule[]} [rewrite]
 *
 * @typedef ProxyRuleEntry
 * @property {URL} url
 * @property {RegExp} [pattern]
 * @property {{protocol?: boolean, host?: boolean}} matches
 *
 * @typedef ProxyRule
 * @property {ProxyOptions} proxy
 * @property {string[]} context
 * @property {ProxyRuleEntry[]} entries
 */

/**
 * @param {ProxyRule[]} rules
 * @returns {ProxyRule[]}
 */
function normalizeRules(rules) {
  return rules.reduce((collection, original) => {
    const rule = { ...original }
    if (!rule.proxy || !rule.context) {
      return collection
    }
    collection.push(rule)
    return collection
  }, [])
}

/**
 * @param {string} expression
 * @returns {ProxyRuleEntry}
 */
function parseRuleEntry(expression) {
  const pattern = hooks.utils.regexp(expression)
  if (pattern) return { pattern }
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
  return { url, matches }
}

/**
 * @param {ProxyRule[]} rules
 * @returns {ProxyRule[]}
 */
export function parseProxyRules(rules) {
  rules = normalizeRules(rules)
  return rules.reduce((collection, original) => {
    const rule = { ...original }
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

/**
 * @param {ProxyRule[]} rules
 * @param {string} url
 */
function getMatchedProxyRules(rules, url) {
  return rules.filter(rule => rule.entries.some(entry => {
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
 * @returns {ProxyOptions}
 */
export function getProxyByURL(rules, url) {
  url = new URL(url)
  const matched = getMatchedProxyRules(rules, url)
  const rule = matched.find(rule => rule.proxy.target)
  return rule ? rule.proxy : { target: url.origin }
}

/**
 * @param {ProxyRule[]} rules
 * @param {string} url
 * @returns {ProxyRewriteRule[]}
 */
export function getRewriteRulesByURL(rules, url) {
  url = new URL(url)
  const matched = getMatchedProxyRules(rules, url)
  return [].concat(...matched.map(rule => rule.proxy.rewrite).filter(Boolean))
}

/**
 * @param {'request'|'response'} when
 * @param {Request|Response} target
 * @param {ProxyRewriteRule} rule
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
 * @param {Request|Response} target
 * @param {ProxyRewriteRule} rule
 */
function setRewritingContent(when, target, rule, content) {
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
 * @param {Request|Response} target
 * @param {ProxyRewriteRule[]} rule
 */
export function rewriteProxy(when, target, rules) {
  rules = rules.filter(item => item.when === when)
  for (const rule of rules) {
    const original = getRewritingContent(when, target, rule)
    let matched = true
    if (rule.from) {
      const regexp = hooks.utils.regexp(rule.from)
      matched = regexp ? original.match(regexp) : original === rule.from
    }
    let content = rule.content
    if (Array.isArray(matched) && content !== null) {
      content = content
        .replace(/\$(\d+)/, (sign, group) => matched[group])
    }
    setRewritingContent(when, target, rule, content)
  }
}

/**
 * @param {ProxyRule[]} rules
 */
export function trackRuleTargets(rules) {
  rules = normalizeRules(rules)
  rules = cloneDeep(rules)
  rules.forEach(({ proxy }) => {
    proxy._target = proxy.target
  })
  return rules
}

/**
 * @param {ProxyRule[]} rules
 */
export function resolveRuleTargets(rules) {
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

export async function getMacOSCurrentNetworkService() {
  const networkInterface = 'route get default | grep interface | awk \'{print $2}\''
  const pipes = [
    'networksetup -listnetworkserviceorder',
    `grep -C1 $(${networkInterface})`,
    // 'awk "FNR == 1{print $2}"'
    'head -n 1 | cut -d " " -f2-',
  ]
  const { stdout } = await hooks.utils.exec(pipes.join(' | '))
  return stdout.trim()
}

export async function getGlobalWebProxy() {
  if (process.platform !== 'darwin') return
  const service = await getMacOSCurrentNetworkService()
  if (!service) return
  const { stdout } = await hooks.utils.exec(`networksetup -getwebproxy "${service}"`)
  return stdout.trim().split('\n').reduce((result, line) => {
    const [key, value] = line.split(': ')
    result[key.trim()] = value.trim()
    return result
  }, {})
}

export async function setGlobalWebProxy(options) {
  if (process.platform !== 'darwin') return
  const service = await getMacOSCurrentNetworkService()
  if (!service) return
  const { host, port } = { host: '""', port: 0, ...options }
  const args = [host, port].join(' ')
  const commands = [
    `networksetup -setwebproxy "${service}" ${args}`,
    `networksetup -setsecurewebproxy "${service}" ${args}`,
  ]
  if (!options) {
    commands.push(
      `networksetup -setwebproxystate "${service}" off`,
      `networksetup -setsecurewebproxystate "${service}" off`,
    )
  }
  return hooks.utils.exec(commands.join(' && '))
}
