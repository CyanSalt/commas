import fallback from '@assets/themes/oceanic-next.json'
import {rgba, rgb} from '../../utils/theme'
import {userStorage, assetsStorage} from '../../../common/storage'

export default {
  namespaced: true,
  state: {
    fallback,
    name: null,
    theme: null,
    watcher: null,
  },
  mutations: {
    setName(state, value) {
      state.name = value
    },
    setTheme(state, value) {
      state.theme = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({commit, dispatch, rootGetters}) {
      const theme = {...fallback}
      const settings = rootGetters['settings/settings']
      const defaultSettings = rootGetters['settings/fallback']
      const name = settings['terminal.theme.name']
      if (name && name !== defaultSettings['terminal.theme.name']) {
        const path = `themes/${name}.json`
        let file = await assetsStorage.load(path)
        if (!file) {
          file = await userStorage.load(path)
          if (file) dispatch('watch', path)
        }
        if (file) Object.assign(theme, file)
      }
      commit('setName', name)
      const customization = settings['terminal.theme.customization']
      if (customization) {
        Object.assign(theme, customization)
      }
      const opacity = settings['terminal.style.opacity']
      if (theme.background && opacity < 1 && opacity > 0) {
        theme.background = rgba(theme.background, opacity)
      }
      theme.backdrop = theme.background
      theme.background = rgb(theme.backdrop)
      await dispatch('eject')
      commit('setTheme', theme)
      dispatch('inject')
    },
    inject({state, rootGetters}) {
      const theme = state.theme
      const settings = rootGetters['settings/settings']
      const element = document.createElement('style')
      element.id = 'app-theme'
      const properties = {}
      ;['backdrop', ...Object.keys(fallback)].forEach(key => {
        if (!theme[key]) return
        properties[`--theme-${key.toLowerCase()}`] = theme[key]
      })
      // TODO: use custom.css instead of styles in settings.json
      properties['font-size'] = settings['terminal.style.fontSize'] + 'px'
      properties['font-family'] = settings['terminal.style.fontFamily']
      const declarations = Object.keys(properties)
        .map(key => `${key}: ${properties[key]};`).join(' ')
      element.appendChild(document.createTextNode(`#app { ${declarations} }`))
      document.head.appendChild(element)
      if (theme.type) document.body.classList.add(theme.type)
    },
    eject({state}) {
      const theme = state.theme
      if (!theme) return
      // TODO: performance review
      const element = document.getElementById('app-theme')
      if (element) element.remove()
      if (theme.type) document.body.classList.remove(theme.type)
    },
    watch({state, commit, dispatch}, file) {
      if (state.watcher) state.watcher.close()
      const watcher = userStorage.watch(file, async () => {
        await dispatch('load')
        dispatch('terminal/refresh', null, {root: true})
      })
      commit('setWatcher', watcher)
    },
  },
}
