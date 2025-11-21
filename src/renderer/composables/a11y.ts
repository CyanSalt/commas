import { injectIPC } from '../utils/composables'

const a11yEnabled = $(injectIPC('a11y-enabled', false))

export function useA11yEnabled() {
  return $$(a11yEnabled)
}
