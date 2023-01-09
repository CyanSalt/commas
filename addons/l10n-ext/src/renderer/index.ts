import * as commas from 'commas:api/renderer'
import LocaleSelector from './LocaleSelector.vue'
import type { LanguageOption } from './locales'

declare module '../../../../api/modules/context' {
  export interface Context {
    'l10n-ext.locale': LanguageOption,
  }
}

export default () => {

  commas.context.provide('l10n-ext.locale', {
    label: 'English',
    value: 'en-US',
  })

  commas.context.provide('l10n-ext.locale', {
    label: 'Chinese (Simplified)',
    value: 'zh-CN',
  })

  commas.context.provide('preference.item', {
    component: LocaleSelector,
    group: 'customization',
  })

}
