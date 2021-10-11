import { memoize } from 'lodash-es'
import { injectIPC } from '../utils/hooks'

export const useUserLanguage = memoize(() => {
  return injectIPC<string>('user-language', '')
})
