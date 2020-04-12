import {remote, shell} from 'electron'
import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import {FitAddon} from 'xterm-addon-fit'
import {SearchAddon} from 'xterm-addon-search'
import {WebLinksAddon} from 'xterm-addon-web-links'
import {Unicode11Addon} from 'xterm-addon-unicode11'
import {LigaturesAddon} from 'xterm-addon-ligatures'
import {debounce} from 'lodash'
import {getCwd, getWindowsProcessInfo} from '../../utils/terminal'
import {normalizeTheme} from '../../utils/theme'
import {exec, unreactive} from '../../utils/helper'
import {currentWindow} from '../../utils/frame'
import {isPackaged} from '../../../common/electron'

const variables = {
  LANG: remote.app.getLocale().replace('-', '_') + '.UTF-8',
  TERM_PROGRAM: remote.app.name,
  TERM_PROGRAM_VERSION: remote.app.getVersion(),
}

export default {
  namespaced: true,
  state: {
    tabs: [],
    shells: [],
    active: -1,
    observer: null,
  },
  getters: {
    current(state) {
      const active = state.active
      if (active === -1) return null
      const tabs = state.tabs
      const tab = tabs[active]
      return tab
    },
    shell(state, getters, rootState) {
      const settings = rootState.settings.settings
      return settings['terminal.shell.path'] || (
        process.platform === 'win32' ? process.env.COMSPEC : process.env.SHELL
      )
    },
  },
  mutations: {
    updateTab(state, {id, ...props}) {
      let tab = state.tabs.find(item => item.id === id)
      if (tab) Object.assign(tab, props)
    },
    appendTab(state, tab) {
      state.tabs.push(tab)
    },
    removeTab(state, index) {
      state.tabs.splice(index, 1)
    },
    moveTab(state, [from, to]) {
      const fromIndex = state.tabs.indexOf(from)
      const toIndex = state.tabs.indexOf(to)
      if (fromIndex < toIndex) {
        state.tabs.splice(toIndex + 1, 0, from)
        state.tabs.splice(fromIndex, 1)
      } else {
        state.tabs.splice(fromIndex, 1)
        state.tabs.splice(toIndex, 0, from)
      }
      if (state.active === fromIndex) {
        state.active = toIndex
      } else if (state.active > fromIndex && state.active < toIndex) {
        state.active -= 1
      } else if (state.active < fromIndex && state.active > toIndex) {
        state.active += 1
      }
    },
    setShells(state, value) {
      state.shells = value
    },
    setActive(state, value) {
      state.active = value
    },
    setObserver(state, value) {
      state.observer = value
    },
  },
  actions: {
    async load({commit}) {
      if (process.platform === 'win32') return
      const {stdout} = await exec('grep "^/" /etc/shells')
      commit('setShells', stdout.trim().split('\n'))
    },
    spawn({state, getters, commit, dispatch, rootState, rootGetters}, payload) {
      payload = payload || {}
      const settings = rootGetters['settings/settings']
      const env = {
        ...process.env,
        ...settings['terminal.shell.env'],
        ...variables,
      }
      // Fix NVM `npm_config_prefix` error in development environment
      if (!isPackaged && env.npm_config_prefix) delete env.npm_config_prefix
      const shell = payload.shell || getters.shell
      // Initialize node-pty process
      const cwd = payload.cwd || env.HOME
      const options = {
        name: 'xterm-256color',
        cwd,
        env,
      }
      let args = settings['terminal.shell.args']
      if (process.platform === 'win32') {
        args = settings['terminal.shell.args.windows']
      } else {
        options.encoding = 'utf8'
      }
      const pty = spawn(shell, args, options)
      const id = pty.pid
      // Initialize xterm.js and attach it to the DOM
      const xterm = new Terminal({
        fontSize: settings['terminal.style.fontSize'],
        fontFamily: settings['terminal.style.fontFamily'],
        allowTransparency: true,
        theme: normalizeTheme(rootState.theme.theme),
      })
      xterm.$ = {}
      // Setup communication between xterm.js and node-pty
      xterm.onData(data => {
        pty.write(data)
      })
      pty.onData(data => {
        xterm.write(data)
        // TODO: performance review
        // pty.process on Windows will be always equivalent to pty.name
        if (process.platform !== 'win32') {
          commit('updateTab', {id, process: pty.process})
        }
      })
      pty.onExit(() => {
        if (xterm.element) {
          state.observer.unobserve(xterm.element)
        }
        xterm.dispose()
        dispatch('remove', id)
      })
      xterm.onResize(({cols, rows}) => {
        pty.resize(cols, rows)
      })
      xterm.onTitleChange(title => {
        const patch = {id, title}
        if (process.platform === 'win32') {
          const info = getWindowsProcessInfo(getters.shell, title)
          if (info) Object.assign(patch, info)
        }
        commit('updateTab', patch)
      })
      if (settings['terminal.tab.liveCwd']) {
        const updateCwd = debounce(async () => {
          const cwd = await getCwd(id)
          if (cwd) commit('updateTab', {id, cwd})
        }, 250)
        xterm.onKey(({key, domEvent}) => {
          if (domEvent.keyCode === 13) updateCwd()
        })
      }
      // Create new tab for current terminal
      // TODO: put this before pty and xterm created
      const tab = {
        id,
        cwd,
        shell,
        title: '',
        process: pty.process,
        pty: unreactive(pty),
        xterm: unreactive(xterm),
      }
      if (payload.launcher) tab.launcher = payload.launcher
      commit('appendTab', tab)
      commit('setActive', state.tabs.length - 1)
    },
    mount({state, commit, dispatch, rootState}, {tab, element}) {
      let observer = state.observer
      if (!observer) {
        observer = new ResizeObserver(debounce(() => {
          dispatch('resize')
        }, 250))
        commit('setObserver', observer)
      }
      const settings = rootState.settings.settings
      const xterm = tab.xterm
      xterm.open(element)
      xterm.$.fit = new FitAddon()
      xterm.loadAddon(xterm.$.fit)
      xterm.$.search = new SearchAddon()
      xterm.loadAddon(xterm.$.search)
      xterm.loadAddon(new WebLinksAddon((event, uri) => {
        const settings = rootState.settings.settings // real-time value
        const shouldOpen = settings['terminal.link.modifier'] === 'Alt' ? event.altKey
          : (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
        if (shouldOpen) shell.openExternal(uri)
      }))
      xterm.loadAddon(new Unicode11Addon())
      xterm.unicode.activeVersion = '11'
      if (settings['terminal.style.fontLigatures']) {
        xterm.$.ligatures = new LigaturesAddon()
        xterm.loadAddon(xterm.$.ligatures)
      }
      observer.observe(element)
      xterm.$.fit.fit()
      xterm.focus()
    },
    interact({state, commit}, tab) {
      const tabs = state.tabs
      const index = tabs.findIndex(item => item.id === tab.id)
      if (index !== -1) {
        commit('setActive', index)
      } else {
        commit('appendTab', tab)
        commit('setActive', state.tabs.length - 1)
      }
    },
    resize({getters}) {
      const current = getters.current
      if (current && current.xterm && current.xterm.element) {
        current.xterm.$.fit.fit()
      }
    },
    input(store, {tab, data}) {
      tab.pty.write(data)
    },
    activate({state, commit}, tab) {
      const tabs = state.tabs
      const index = tabs.indexOf(tab)
      if (index !== -1) {
        commit('setActive', index)
      }
    },
    close({dispatch}, tab) {
      if (tab.internal) {
        dispatch('remove', tab.id)
      } else {
        tab.pty.kill()
      }
    },
    remove({state, commit, dispatch, rootState}, id) {
      const index = state.tabs.findIndex(tab => tab.id === id)
      if (index === -1) return
      commit('removeTab', index)
      const length = state.tabs.length
      if (!length) {
        if (rootState.proxy.server) {
          dispatch('spawn')
        } else {
          currentWindow.close()
        }
      } else {
        const active = state.active > index
          ? state.active - 1 : Math.min(index, length - 1)
        commit('setActive', active)
      }
    },
    find({getters}, {keyword, options, back}) {
      const current = getters.current
      if (back) {
        current.xterm.$.search.findPrevious(keyword, options)
      } else {
        current.xterm.$.search.findNext(keyword, options)
      }
    },
    clear({getters}) {
      const current = getters.current
      current.xterm.clear()
    },
    refresh({state, rootState, rootGetters}) {
      const tabs = state.tabs
      const settings = rootGetters['settings/settings']
      // TODO: performance review
      for (const tab of tabs) {
        if (tab.internal) continue
        const xterm = tab.xterm
        xterm.setOption('fontSize', settings['terminal.style.fontSize'])
        xterm.setOption('fontFamily', settings['terminal.style.fontFamily'])
        xterm.setOption('theme', normalizeTheme(rootState.theme.theme))
        // TODO: unload when settings disabled
        if (settings['terminal.style.fontLigatures']) {
          if (!xterm.$.ligatures) {
            xterm.$.ligatures = new LigaturesAddon()
            xterm.loadAddon(xterm.$.ligatures)
          }
        }
      }
    },
  },
}
