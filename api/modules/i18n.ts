import { translate, addTranslation, removeTranslation } from '../../main/lib/i18n'
import type { Dictionary } from '../../typings/i18n'

function noConflictAddTranslation(locales: string[], dictionary: Dictionary) {
  addTranslation(locales, dictionary)
  this.$.app.onCleanup(() => {
    removeTranslation(locales, dictionary)
  })
}

export {
  translate,
  noConflictAddTranslation as addTranslation,
}
