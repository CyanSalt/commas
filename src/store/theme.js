import defaultTheme from '../assets/themes/oceanic-next.json'

export default {
  states: {
    default: defaultTheme,
    user: {},
  },
  accessors: {
    xterm({state}) {
      // Apply transparency background color
      let theme = state.get([this, 'user'])
      let allowTransparency = false
      if (theme.background.match(/^(?:#[0-9A-Fa-f]{8}$)|rgba/)) {
        allowTransparency = true
        theme = {...theme, background: 'transparent'}
      }
      return {allowTransparency, theme}
    },
  },
  actions: {
    load({state}) {
      const theme = defaultTheme
      const settings = state.get('settings.user')
      const specified = settings['terminal.style.theme']
      if (typeof specified === 'object') {
        Object.assign(theme, specified)
      }
      state.set([this, 'user'], theme)
      return defaultTheme
    },
    inject({state}, element) {
      const theme = state.get([this, 'user'])
      element.style.setProperty('--theme-background', theme.background)
    },
  }
}
