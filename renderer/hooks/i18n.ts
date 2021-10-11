import { memoize } from 'lodash-es'
import { injectIPC } from '../utils/hooks'

export const useLanguage = memoize(() => {
  return injectIPC<string | undefined>('language', undefined)
})
