import { app } from 'electron'
import { provideIPC } from '../utils/compositions'

declare module '@commas/electron-ipc' {
  export interface Refs {
    'a11y-enabled': typeof a11yEnabled,
  }
}

const a11yEnabled = $customRef((track, trigger) => {
  let enabled = false
  app.on('ready', () => {
    enabled = app.accessibilitySupportEnabled
    trigger()
  })
  app.on('accessibility-support-changed', (event, accessibilitySupportEnabled) => {
    enabled = accessibilitySupportEnabled
    trigger()
  })
  return {
    get() {
      track()
      return enabled
    },
    set(value) {
      app.accessibilitySupportEnabled = value
    },
  }
})

function handleA11yMessages() {
  provideIPC('a11y-enabled', $$(a11yEnabled))
}

export {
  handleA11yMessages,
}
