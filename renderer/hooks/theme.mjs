import { computed, unref, watchEffect } from 'vue'
import { memoize } from 'lodash-es'
import { useRemoteData } from './remote'

export const useTheme = memoize(() => {
  return useRemoteData({}, {
    getter: 'get-theme',
    effect: 'theme-updated',
  })
})

const themeStyleRef = computed(() => {
  const theme = unref(useTheme())
  return Object.fromEntries(
    Object.entries(theme).filter(([key, value]) => value)
      .map(([key, value]) => [`--theme-${key.toLowerCase()}`, value])
  )
})

export function injectTheme() {
  watchEffect((onInvalidate) => {
    const theme = unref(useTheme())
    const type = theme.type
    document.body.dataset.themeType = type
    onInvalidate(() => {
      delete document.body.dataset.themeType
    })
  })
  watchEffect((onInvalidate) => {
    const style = unref(themeStyleRef)
    const declarations = Object.entries(style)
      .map(([key, value]) => `${key}: ${value};`).join(' ')
    const element = document.createElement('style')
    element.appendChild(document.createTextNode(`#root { ${declarations} }`))
    document.head.appendChild(element)
    onInvalidate(() => {
      element.remove()
    })
  })
}
