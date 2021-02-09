import type { TranslationFileEntry } from '../../main/lib/i18n'
import { addTranslationDirectory, addTranslations, Priority, removeTranslation, translate } from '../../main/lib/i18n'

async function noConflictAddTranslations(entries: TranslationFileEntry[]) {
  const translation = await addTranslations(entries, Priority.addon)
  if (translation) {
    this.$.app.onCleanup(() => {
      removeTranslation(translation)
    })
  }
}

async function noConflictAddTranslationDirectory(directory: string) {
  const translation = await addTranslationDirectory(directory, Priority.addon)
  if (translation) {
    this.$.app.onCleanup(() => {
      removeTranslation(translation)
    })
  }
}

export {
  translate,
  noConflictAddTranslationDirectory as addTranslationDirectory,
  noConflictAddTranslations as addTranslations,
}
