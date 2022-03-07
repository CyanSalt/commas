import * as commas from 'commas:api/renderer'
import LocaleSelector from './locale-selector.vue'

commas.context.provide('locales', {
  label: 'English',
  value: 'en-US',
})

commas.context.provide('locales', {
  label: 'Chinese (Simplified)',
  value: 'zh-CN',
})

commas.context.provide('preference', {
  component: LocaleSelector,
  group: 'customization',
})
