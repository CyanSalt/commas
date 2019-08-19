import fallback from '@assets/themes/oceanic-next.json'
import {colors} from '@/utils/theme'
import FileStorage from '@/utils/storage'

export default {
  namespaced: true,
  state: {
    fallback,
    theme: null,
    watcher: null,
  },
  mutations: {
    setTheme(state, value) {
      state.theme = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({commit, dispatch, rootState}) {
      const theme = {...fallback}
      const settings = rootState.settings.settings
      const specified = settings['terminal.theme.name']
      if (specified && specified !== 'oceanic-next') {
        const path = `themes/${specified}.json`
        let file = await FileStorage.assets().load(path)
        if (!file) {
          file = await FileStorage.load(path)
          if (file) dispatch('watch', path)
        }
        if (file) Object.assign(theme, file)
      }
      const customization = settings['terminal.theme.customization']
      if (customization) {
        Object.assign(theme, customization)
      }
      await dispatch('eject')
      commit('setTheme', theme)
      dispatch('inject')
    },
    inject({state, rootState}) {
      const theme = state.theme
      const settings = rootState.settings.settings
      const element = document.createElement('style')
      element.id = 'app-theme'
      const properties = {}
      colors.forEach(key => {
        if (!theme[key]) return
        properties[`--theme-${key.toLowerCase()}`] = theme[key]
      })
      // TODO: use custom.css instead of styles in settings.json
      properties['font-size'] = settings['terminal.style.fontSize'] + 'px'
      properties['font-family'] = settings['terminal.style.fontFamily']
      const declarations = Object.keys(properties)
        .map(key => `${key}: ${properties[key]};`).join(' ')
      element.appendChild(document.createTextNode(`#main { ${declarations} }`))
      document.head.appendChild(element)
      document.body.classList.add(theme.type)
    },
    eject({state}) {
      const theme = state.theme
      if (!theme) return
      // TODO: performance review
      const element = document.getElementById('app-theme')
      if (element) element.remove()
      document.body.classList.remove(theme.type)
    },
    watch({state, commit, dispatch}, file) {
      if (state.watcher) state.watcher.close()
      const watcher = FileStorage.watch(file, async () => {
        await dispatch('load')
        dispatch('terminal/refresh', null, {root: true})
      })
      commit('setWatcher', watcher)
    },
  },
}
