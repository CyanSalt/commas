import * as commas from 'commas:api/renderer'
import LocaleSelector from './LocaleSelector.vue'
import type { LanguageOption } from './locales'

declare module '../../../../api/modules/context' {
  export interface Context {
    locales: LanguageOption,
  }
}

export default () => {

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

}
