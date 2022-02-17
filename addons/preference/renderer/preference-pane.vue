<script lang="ts" setup>
import { ipcRenderer, shell } from 'electron'
import type { Component } from 'vue'
import * as commas from '../../../api/renderer'
import TerminalPane from '../../../renderer/components/basic/terminal-pane.vue'
import { useAsyncComputed } from '../../../renderer/utils/compositions'
import { getAppVersion } from '../../../renderer/utils/frame'

interface PreferenceItem {
  component: Component,
  group: string,
  priority?: number,
}

const preferenceItems: PreferenceItem[] = commas.context.getCollection('preference')

function getItems(group: string) {
  const list = preferenceItems.filter(item => item.group === group)
  return list.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
}

const generalItems = $computed(() => getItems('general'))
const featureItems = $computed(() => getItems('feature'))
const customizationItems = $computed(() => getItems('customization'))
const aboutItems = $computed(() => getItems('about'))

const version = $(useAsyncComputed(() => getAppVersion(), ''))

function openUserDirectory() {
  ipcRenderer.invoke('open-user-directory')
}

function openDefaultSettings() {
  ipcRenderer.invoke('open-default-settings')
}

function openSettingsFile() {
  ipcRenderer.invoke('open-settings-file')
}

function openKeyBindings() {
  ipcRenderer.invoke('open-user-file', 'keybindings.yaml', true)
}

function openTranslation() {
  ipcRenderer.invoke('open-user-file', 'translation.yaml', true)
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
</script>

<template>
  <TerminalPane class="preference-pane">
    <h2 v-i18n class="group-title">General#!preference.2</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in generalItems"
        :key="index"
      />
      <span class="link" @click="openUserDirectory">
        <span v-i18n>Open user directory#!preference.6</span>
      </span>
      <span class="link" @click="openDefaultSettings">
        <span v-i18n>Open default settings#!preference.7</span>
      </span>
      <span class="link" @click="openSettingsFile">
        <span v-i18n="{ F: 'settings.yaml' }">Edit %F#!preference.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Features#!preference.3</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in featureItems"
        :key="index"
      />
    </div>
    <h2 v-i18n class="group-title">Customization#!preference.4</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in customizationItems"
        :key="index"
      />
      <span class="link" @click="openKeyBindings">
        <span v-i18n="{ F: 'keybindings.yaml' }">Edit %F#!preference.8</span>
      </span>
      <span class="link" @click="openTranslation">
        <span v-i18n="{ F: 'translation.yaml' }">Edit %F#!preference.8</span>
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
      <span v-i18n="{ V: version }" class="text">Current version: %V#!preference.9</span>
      <component
        :is="item.component"
        v-for="(item, index) in aboutItems"
        :key="index"
      />
      <span v-i18n class="link" @click="openWebsite">Visit our website#!preference.10</span>
    </div>
  </TerminalPane>
</template>
