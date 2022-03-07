import { stop } from '@vue/reactivity'
import { addTranslationDirectory, addTranslations, Priority, translate } from '../../main/lib/i18n'
import type { TranslationFileEntry } from '../../main/lib/i18n'
import type { CommasContext } from '../types'

async function noConflictAddTranslations(this: CommasContext, entries: TranslationFileEntry[]) {
  const reactiveEffect = addTranslations(entries, Priority.addon)
  this.$.app.onCleanup(() => {
    stop(reactiveEffect)
  })
}

async function noConflictAddTranslationDirectory(this: CommasContext, directory: string) {
  const reactiveEffect = await addTranslationDirectory(directory, Priority.addon)
  this.$.app.onCleanup(() => {
    stop(reactiveEffect)
  })
}

export * from '../shim'

export {
  translate,
  noConflictAddTranslationDirectory as addTranslationDirectory,
  noConflictAddTranslations as addTranslations,
}
