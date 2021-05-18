import { addTranslationDirectory, addTranslations, Priority, removeTranslation, translate } from '../../main/lib/i18n'
import type { TranslationFileEntry } from '../../main/lib/i18n'
import type { CommasContext } from '../types'

async function noConflictAddTranslations(this: CommasContext, entries: TranslationFileEntry[]) {
  const translation = await addTranslations(entries, Priority.addon)
  if (translation) {
    this.$.app.onCleanup(() => {
      removeTranslation(translation)
    })
  }
}

async function noConflictAddTranslationDirectory(this: CommasContext, directory: string) {
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
