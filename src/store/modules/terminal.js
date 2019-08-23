import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as search from 'xterm/lib/addons/search/search'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import * as ligatures from 'xterm-addon-ligatures'
import {remote, shell} from 'electron'
import {getCwd} from '@/utils/terminal'
import {normalizeTheme} from '@/utils/theme'
import {unreactive} from '@/utils/object'
import {debounce} from 'lodash'

Terminal.applyAddon(fit)
Terminal.applyAddon(search)
Terminal.applyAddon(webLinks)
Terminal.applyAddon(ligatures)

const variables = {
  LANG: remote.app.getLocale().replace('-', '_') + '.UTF-8',
  TERM_PROGRAM: remote.app.getName(),
  TERM_PROGRAM_VERSION: remote.app.getVersion(),
}

const isPackaged = remote.app.isPackaged

export default {
  namespaced: true,
  state: {
    tabs: [],
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
    setActive(state, value) {
      state.active = value
    },
    setObserver(state, value) {
      state.observer = value
    },
  },
  actions: {
    spawn({state, getters, commit, dispatch, rootState}, payload) {
      payload = payload || {}
      const settings = rootState.settings.settings
      const env = {
        ...process.env,
        ...settings['terminal.shell.env'],
        ...variables,
      }
      // Fix NVM `npm_config_prefix` error in development environment
      if (!isPackaged && env.npm_config_prefix) delete env.npm_config_prefix
      // Initialize node-pty process
      const cwd = payload.cwd || env.HOME
      const pty = spawn(getters.shell, settings['terminal.shell.args'], {
        name: 'xterm-256color',
        encoding: 'utf8',
        cwd,
        env,
      })
      const id = pty.pid
      // Initialize xterm.js and attach it to the DOM
      const xterm = new Terminal({
        fontSize: settings['terminal.style.fontSize'],
        fontFamily: settings['terminal.style.fontFamily'],
        allowTransparency: true,
        theme: normalizeTheme(rootState.theme.theme),
      })
      // Setup communication between xterm.js and node-pty
      xterm.onData(data => {
        pty.write(data)
      })
      pty.on('data', data => {
        xterm.write(data)
        // TODO: performance review
        commit('updateTab', {id, process: pty.process})
      })
      pty.on('exit', () => {
        if (xterm.element) {
          state.observer.unobserve(xterm.element)
        }
        xterm.destroy()
        dispatch('remove', id)
      })
      xterm.onResize(({cols, rows}) => {
        pty.resize(cols, rows)
      })
      xterm.onTitleChange(title => {
        commit('updateTab', {id, title})
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
      requestIdleCallback(() => {
        if (xterm.element) {
          element.appendChild(xterm.element)
        } else {
          xterm.open(element)
          observer.observe(element)
          xterm.webLinksInit((event, uri) => {
            if (event.altKey) shell.openExternal(uri)
          })
          if (settings['terminal.style.fontLigatures']) {
            xterm.enableLigatures()
          }
        }
        xterm.fit()
        xterm.focus()
      }, {timeout: 1000})
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
        current.xterm.fit()
      }
    },
    input(store, {tab, data}) {
      tab.pty.write(data)
    },
    activite({state, commit}, tab) {
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
          remote.getCurrentWindow().close()
        }
      } else if (state.active === index) {
        commit('setActive', Math.min(index, length - 1))
      }
    },
    find({getters}, {keyword, options, back}) {
      const current = getters.current
      if (back) {
        current.xterm.findPrevious(keyword, options)
      } else {
        current.xterm.findNext(keyword, options)
      }
    },
    clear({getters}) {
      const current = getters.current
      current.xterm.clear()
    },
    refresh({state, rootState}) {
      const tabs = state.tabs
      const settings = rootState.settings.settings
      // TODO: performance review
      for (const tab of tabs) {
        if (tab.internal) continue
        const xterm = tab.xterm
        xterm.setOption('fontSize', settings['terminal.style.fontSize'])
        xterm.setOption('fontFamily', settings['terminal.style.fontFamily'])
        xterm.setOption('theme', normalizeTheme(rootState.theme.theme))
        if (settings['terminal.style.fontLigatures']) {
          xterm.enableLigatures()
        }
      }
    },
  },
}
