import { memoize } from 'lodash-es'
import { injectIPC } from '../utils/compositions'

export const useLanguage = memoize(() => {
  return injectIPC<string | undefined>('language', undefined)
})
