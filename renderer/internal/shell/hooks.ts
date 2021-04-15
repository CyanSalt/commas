import { memoize } from 'lodash-es'
import { injectIPC } from '../../utils/hooks'

export const useShellCommands = memoize(() => {
  return injectIPC<string[]>('shell-commands', [])
})
