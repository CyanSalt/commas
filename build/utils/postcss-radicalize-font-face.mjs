import parser from 'css-font-face-src'

/**
 * @template T
 * @param {T[]} values
 * @param {((value: T, index: number, obj: T[]) => unknown)[]} predicates
 * @returns {number}
 */
function findAnyIndexOf(values, predicates) {
  for (const predicate of predicates) {
    const index = values.findIndex(predicate)
    if (index !== -1) return index
  }
  return -1
}

/**
 * @type {import('postcss').PluginCreator}
 */
const plugin = () => {
  return {
    postcssPlugin: 'postcss-radicalize-font-face',
    Once: root => {
      root.walkAtRules('font-face', atRule => {
        let lastRule
        atRule.walkDecls('src', rule => {
          if (lastRule) {
            lastRule.remove()
          }
          const srcset = parser.parse(rule.value)
          const matchedIndex = findAnyIndexOf(srcset, [
            item => item.format === 'woff2',
            item => item.format === 'woff',
            item => item.url,
          ])
          if (matchedIndex !== -1) {
            rule.value = parser.serialize(srcset.filter((item, index) => {
              return !item.url || index === matchedIndex
            }))
          }
          lastRule = rule
        })
      })
    },
  }
}

plugin.postcss = true

export default plugin
