import * as path from 'path'
import { stop } from '@vue/reactivity'
import { addTranslationDirectory, addTranslations, Priority, translate } from '../../src/main/lib/i18n'
import type { TranslationFileEntry } from '../../src/main/lib/i18n'
import type { MainAPIContext } from '../types'

async function noConflictAddTranslations(this: MainAPIContext, entries: TranslationFileEntry[]) {
  const reactiveEffect = addTranslations(entries, Priority.addon)
  this.$.app.onCleanup(() => {
    stop(reactiveEffect)
  })
}

async function noConflictAddTranslationDirectory(this: MainAPIContext, directory: string) {
  const reactiveEffect = await addTranslationDirectory(path.resolve(this.__entry__, directory), Priority.addon)
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
