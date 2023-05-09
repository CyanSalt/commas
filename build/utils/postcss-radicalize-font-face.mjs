/**
 * @type {import('postcss').PluginCreator}
 */
const plugin = () => {
  return {
    postcssPlugin: 'postcss-radicalize-font-face',
    Once: root => {
      root.walkAtRules('font-face', atRule => {
        atRule.walkDecls('src', rule => {
          const srcset = rule.value.split(/\s*,\s*/)
          const firstURLIndex = srcset.findIndex(item => /\burl\(/.test(item))
          if (firstURLIndex !== -1) {
            rule.value = srcset.slice(0, firstURLIndex + 1).join(', ')
          }
        })
      })
    },
  }
}

plugin.postcss = true

export default plugin
