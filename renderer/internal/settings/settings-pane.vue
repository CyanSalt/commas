<template>
  <terminal-pane class="settings-pane">
    <h2 v-i18n class="group-title">General#!settings.2</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in generalItems"
        :key="index"
      ></component>
      <span class="link" @click="openUserDirectory">
        <span v-i18n>Open user directory#!settings.6</span>
      </span>
      <span class="link" @click="openDefaultSettings">
        <span v-i18n>Open default settings#!settings.7</span>
      </span>
      <span class="link" @click="openSettingsFile">
        <span v-i18n="{ F: 'settings.json' }">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Features#!settings.3</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in featureItems"
        :key="index"
      ></component>
      <span class="link" @click="openLaunchers">
        <span v-i18n="{ F: 'launchers.json' }">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Customization#!settings.4</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in customizationItems"
        :key="index"
      ></component>
      <span class="link" @click="openKeyBindings">
        <span v-i18n="{ F: 'keybindings.json' }">Edit %F#!settings.8</span>
      </span>
      <span class="link" @click="openTranslation">
        <span v-i18n="{ F: 'translation.json' }">Edit %F#!settings.8</span>
      </span>
      <span class="link" @click="openCustomJS">
        <span v-i18n="{ F: 'custom.js' }">Edit %F#!settings.8</span>
      </span>
      <span class="link" @click="openCustomCSS">
        <span v-i18n="{ F: 'custom.css' }">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">About#!settings.5</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in aboutItems"
        :key="index"
      ></component>
      <span v-i18n="{ V: version }" class="text">Current version: %V#!settings.9</span>
      <span v-i18n class="link" @click="openWebsite">Visit our website#!settings.10</span>
    </div>
  </terminal-pane>
</template>

<script>
import { ipcRenderer, shell } from 'electron'
import { reactive, toRefs, computed } from 'vue'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import SwitchControl from '../../components/basic/switch-control.vue'
import { useAppVersion } from '../../hooks/frame'

export default {
  name: 'SettingsPane',
  components: {
    'terminal-pane': TerminalPane,
    'switch-control': SwitchControl,
  },
  setup() {
    const commas = global.require('../api/renderer')
    const state = reactive({
      version: useAppVersion(),
    })

    const settingsItems = commas.storage.shareArray('settings')

    function getItems(group) {
      const list = settingsItems.filter(item => item.group === group)
      return list.sort((a, b) => (a.priority || 0) - (b.priority || 0))
    }
    state.generalItems = computed(() => getItems('general'))
    state.featureItems = computed(() => getItems('feature'))
    state.customizationItems = computed(() => getItems('customization'))
    state.aboutItems = computed(() => getItems('about'))

    function openUserDirectory() {
      ipcRenderer.invoke('open-user-directory')
    }

    function openDefaultSettings() {
      ipcRenderer.invoke('open-default-settings')
    }

    function openSettingsFile() {
      ipcRenderer.invoke('open-settings-file')
    }

    function openLaunchers() {
      ipcRenderer.invoke('open-user-file', 'launchers.json', true)
    }

    function openKeyBindings() {
      ipcRenderer.invoke('open-user-file', 'keybindings.json', true)
    }

    function openTranslation() {
      ipcRenderer.invoke('open-user-file', 'translation.json', true)
    }

    function openCustomJS() {
      ipcRenderer.invoke('open-user-file', 'custom.js', true)
    }

    function openCustomCSS() {
      ipcRenderer.invoke('open-user-file', 'custom.css', true)
    }

    function openWebsite() {
      shell.openExternal('https://github.com/CyanSalt/commas')
    }

    return {
      ...toRefs(state),
      openUserDirectory,
      openDefaultSettings,
      openSettingsFile,
      openLaunchers,
      openKeyBindings,
      openTranslation,
      openCustomJS,
      openCustomCSS,
      openWebsite,
    }
  },
}
</script>