import type { ClientRequest, IncomingMessage, ServerResponse, OutgoingMessage } from 'http'
import type { ServerOptions } from 'http-proxy'
import cloneDeep from 'lodash/cloneDeep'
import { createPattern } from '../../utils/helper'

interface RewritingRule {
  when: 'request' | 'response',
  type: 'header' | 'body',
  content: any,
  name?: string,
  from?: string,
}

interface ProxyRuleMatcher {
  protocol?: boolean,
  host?: boolean,
}

interface ProxyRuleEntry {
  pattern?: RegExp,
  url: URL,
  matches: ProxyRuleMatcher,
}

export interface ProxyRule {
  proxy: ServerOptions & {
    target: string,
    _target?: string,
    rewrite?: RewritingRule[],
    records?: string[],
  },
  context: string[],
  entries: ProxyRuleEntry[],
  title?: string,
  disabled?: boolean,
  _enabled?: boolean,
}

function getValidRules(rules: ProxyRule[]) {
  return cloneDeep(rules.filter((rule: any) => rule.proxy && rule.context))
}

function parseRuleEntry(expression: string) {
  const pattern = createPattern(expression)
  if (pattern) return { pattern } as ProxyRuleEntry
  const matches: ProxyRuleMatcher = {}
  let href = expression
  if (expression.startsWith('//')) {
    matches.host = true
    href = 'http:' + href
  } else if (expression.startsWith('/')) {
    href = 'http://localhost' + href
  } else if (expression.includes('://')) {
    matches.host = true
    matches.protocol = true
  } else {
    matches.host = true
    href = 'http://' + href
  }
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  return { url, matches }
}

function extractProxyRules(rules: ProxyRule[]) {
  return getValidRules(rules).reduce<ProxyRule[]>((collection, rule) => {
    const entries = rule.context.reduce<ProxyRuleEntry[]>((allEntries, expression) => {
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

function getMatchedProxyRules(rules: ProxyRule[], url: URL) {
  return rules.filter(rule => !rule.disabled && rule.entries.some(entry => {
    if (entry.pattern) return entry.pattern.test(url.href)
    if (entry.matches.host && entry.url.host !== url.host) return false
    if (entry.matches.protocol && entry.url.protocol !== url.protocol) return false
    if (entry.url.search && ![...entry.url.searchParams].every(
      ([key, value]) => url.searchParams.get(key) === value,
    )) return false
    return url.pathname.startsWith(entry.url.pathname)
  }))
}

function getProxyServerOptions(rules: ProxyRule[], href: string) {
  const url = new URL(href)
  const matched = getMatchedProxyRules(rules, url)
  const rule = matched.find(item => item.proxy.target)
  return rule ? rule.proxy : { target: url.origin }
}

function getProxyRewritingRules(rules: ProxyRule[], href: string) {
  const url = new URL(href)
  const matched = getMatchedProxyRules(rules, url)
  return matched.flatMap(rule => rule.proxy.rewrite ?? [])
}

function getRewritingContent(when: 'request' | 'response', source: IncomingMessage, rule: RewritingRule) {
  switch (rule.type) {
    case 'header':
      if (when === 'request') {
        if (rule.name === ':method') return source.method
        // TODO: resolve :scheme, :authority and :path from source.url
      } else {
        if (rule.name === ':status') return source.statusCode
      }
      return rule.name && source.headers[rule.name] || ''
    case 'body':
      // TODO: get body from request or response
      return ''
  }
}

function rewriteContent(when: 'request' | 'response', target: OutgoingMessage, rule: RewritingRule, content: any) {
  switch (rule.type) {
    case 'header':
      if (content === null) {
        if (rule.name) target.removeHeader(rule.name)
        return
      }
      if (when === 'request') {
        if (rule.name === ':method') (target as ClientRequest).method = content
        // if (rule.name === ':path') (target as ClientRequest).path = content
      } else {
        if (rule.name === ':status') (target as ServerResponse).writeHead(content)
      }
      if (rule.name) target.setHeader(rule.name, content)
      return
    case 'body':
      target.end(content)
      return
  }
}

function rewriteProxy(when: 'request' | 'response', target: OutgoingMessage, source: IncomingMessage, rules: RewritingRule[]) {
  rules = rules.filter(item => item.when === when)
  for (const rule of rules) {
    const original = getRewritingContent(when, source, rule)
    let matched = true
    let content = rule.content
    if (rule.from) {
      const pattern = createPattern(rule.from)
      if (!pattern) {
        matched = original === rule.from
      } else {
        const originalValue = String(original)
        matched = pattern.test(originalValue)
        if (matched && content !== null) {
          content = originalValue.replace(pattern, content)
        }
      }
    }
    if (matched) {
      rewriteContent(when, target, rule, content)
    }
  }
}

export {
  getValidRules,
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
}
