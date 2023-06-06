import { injectIPC } from '../utils/compositions'

const a11yEnabled = $(injectIPC('a11y-enabled', false))

export function useA11yEnabled() {
  return $$(a11yEnabled)
}
