import { app } from 'electron'
import { provideIPC } from '../utils/compositions'

const a11yEnabled = $computed({
  get: () => app.isAccessibilitySupportEnabled(),
  set: value => {
    app.setAccessibilitySupportEnabled(value)
  },
})

function handleA11yMessages() {
  provideIPC('a11y-enabled', $$(a11yEnabled))
}

export {
  handleA11yMessages,
}
