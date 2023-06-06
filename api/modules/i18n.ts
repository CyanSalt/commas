import * as path from 'node:path'
import type { TranslationFileEntry } from '../../src/main/lib/i18n'
import { addTranslationDirectory, addTranslations, getI18nManifest, Priority, translate } from '../../src/main/lib/i18n'
import type { MainAPIContext } from '../types'

async function noConflictAddTranslations(this: MainAPIContext, entries: TranslationFileEntry[]) {
  const stop = addTranslations(entries, Priority.addon)
  this.$.app.onInvalidate(() => {
    stop()
  })
}

async function noConflictAddTranslationDirectory(this: MainAPIContext, directory: string) {
  const stop = await addTranslationDirectory(path.resolve(this.__entry__, directory), Priority.addon)
  this.$.app.onInvalidate(() => {
    stop()
  })
}

export * from '../shim'

export {
  translate,
  noConflictAddTranslationDirectory as addTranslationDirectory,
  noConflictAddTranslations as addTranslations,
  getI18nManifest,
}
