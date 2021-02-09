import type { TranslationFileEntry } from '../../main/lib/i18n'
import { addTranslations, Priority, removeTranslation, translate } from '../../main/lib/i18n'

async function noConflictAddTranslations(entries: TranslationFileEntry[]) {
  const translation = await addTranslations(entries, Priority.addon)
  if (translation) {
    this.$.app.onCleanup(() => {
      removeTranslation(translation)
    })
  }
}

export {
  translate,
  noConflictAddTranslations as addTranslations,
}
