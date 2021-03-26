<template>
  <terminal-pane class="preference-pane">
    <h2 v-i18n class="group-title">General#!preference.2</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in generalItems"
        :key="index"
      ></component>
      <span class="link" @click="openUserDirectory">
        <span v-i18n>Open user directory#!preference.6</span>
      </span>
      <span class="link" @click="openDefaultSettings">
        <span v-i18n>Open default settings#!preference.7</span>
      </span>
      <span class="link" @click="openSettingsFile">
        <span v-i18n="{ F: 'settings.json' }">Edit %F#!preference.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Features#!preference.3</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in featureItems"
        :key="index"
      ></component>
      <span class="link" @click="openLaunchers">
        <span v-i18n="{ F: 'launchers.json' }">Edit %F#!preference.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Customization#!preference.4</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in customizationItems"
        :key="index"
      ></component>
      <span class="link" @click="openKeyBindings">
        <span v-i18n="{ F: 'keybindings.json' }">Edit %F#!preference.8</span>
      </span>
      <span class="link" @click="openTranslation">
        <span v-i18n="{ F: 'translation.json' }">Edit %F#!preference.8</span>
      </span>
      <span class="link" @click="openCustomJS">
        <span v-i18n="{ F: 'custom.js' }">Edit %F#!preference.8</span>
      </span>
      <span class="link" @click="openCustomCSS">
        <span v-i18n="{ F: 'custom.css' }">Edit %F#!preference.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">About#!preference.5</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in aboutItems"
        :key="index"
      ></component>
      <span v-i18n="{ V: version }" class="text">Current version: %V#!preference.9</span>
      <span v-i18n class="link" @click="openWebsite">Visit our website#!preference.10</span>
    </div>
  </terminal-pane>
</template>

<script lang="ts">
import { ipcRenderer, shell } from 'electron'
import type { Component } from 'vue'
import { computed, reactive, toRefs, watchEffect } from 'vue'
import * as commas from '../../../api/renderer'
import SwitchControl from '../../components/basic/switch-control.vue'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import { getAppVersion } from '../../utils/frame'

interface PreferenceItem {
  component: Component,
  group: string,
  priority?: number,
}

export default {
  name: 'preference-pane',
  components: {
    'terminal-pane': TerminalPane,
    'switch-control': SwitchControl,
  },
  setup() {
    const preferenceItems: PreferenceItem[] = commas.context.getCollection('preference')

    function getItems(group: string) {
      const list = preferenceItems.filter(item => item.group === group)
      return list.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    }

    const state = reactive({
      version: '',
      generalItems: computed(() => getItems('general')),
      featureItems: computed(() => getItems('feature')),
      customizationItems: computed(() => getItems('customization')),
      aboutItems: computed(() => getItems('about')),
    })

    watchEffect(async () => {
      state.version = await getAppVersion()
    })

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
