export function normalizeRules(rules) {
  return rules.reduce((collection, original) => {
    if (!original.proxy) {
      return collection
    }
    const rule = {...original}
    // TODO: `vhost` will be removed after v0.8.0
    if (!rule.host && rule.vhost) {
      rule.host = rule.vhost
      delete rule.vhost
    }
    if (rule.pattern) {
      try {
        rule.pattern = new RegExp(rule.pattern)
      } catch (err) {
        rule.pattern = null
      }
    }
    if (!rule.pattern && !rule.host && !rule.context) {
      return collection
    }
    if (!rule.proxy.target) {
      rule.proxy = {target: rule.proxy}
    }
    collection.push(rule)
    return collection
  }, [])
}

export function getMatchedProxy(rules, url) {
  url = new URL(url)
  const rule = rules.find(rule => {
    if (rule.pattern) return rule.pattern.test(url.href)
    if (rule.host) {
      if (rule.host !== url.hostname) return false
      if (!rule.context || !rule.context.length) return true
    }
    return rule.context.some(path => url.pathname.startsWith(path))
  })
  return rule ? rule.proxy : {target: url.origin}
}
