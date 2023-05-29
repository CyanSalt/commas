<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import type { TerminalTab } from '../../../../src/typings/terminal'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, TerminalPane } = commas.ui.vueAssets

const preferenceItems = commas.context.getCollection('preference.item')

function getItems(group: string) {
  const list = preferenceItems.filter(item => item.group === group)
  return list.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
}

const generalItems = $computed(() => getItems('general'))
const featureItems = $computed(() => getItems('feature'))
const customizationItems = $computed(() => getItems('customization'))
const aboutItems = $computed(() => getItems('about'))

const version = commas.app.getVersion()

function openUserDirectory() {
  commas.remote.openUserDirectory()
}

function openDefaultSettings() {
  commas.remote.openDefaultSettings()
}

function openSettingsFile() {
  commas.remote.openSettingsFile()
}

function openKeyBindings() {
  commas.remote.openUserFile('keybindings.yaml')
}

function openTranslation() {
  commas.remote.openUserFile('translation.yaml')
}

function openCustomJS() {
  commas.remote.openUserFile('custom.js')
}

function openCustomCSS() {
  commas.remote.openUserFile('custom.css')
}

function openWebsite() {
  ipcRenderer.invoke('open-preference-website')
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
        <span v-i18n="{ file: 'settings.yaml' }">Edit ${file}#!preference.8</span>
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
        <span v-i18n="{ file: 'keybindings.yaml' }">Edit ${file}#!preference.8</span>
      </span>
      <span class="link" @click="openTranslation">
        <span v-i18n="{ file: 'translation.yaml' }">Edit ${file}#!preference.8</span>
      </span>
      <span class="link" @click="openCustomJS">
        <span v-i18n="{ file: 'custom.js' }">Edit ${file}#!preference.8</span>
      </span>
      <span class="link" @click="openCustomCSS">
        <span v-i18n="{ file: 'custom.css' }">Edit ${file}#!preference.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">About#!preference.5</h2>
    <div class="group">
      <span v-i18n="{ version }" class="text">Current version: ${version}#!preference.9</span>
      <component
        :is="item.component"
        v-for="(item, index) in aboutItems"
        :key="index"
      />
      <span v-i18n class="link" @click="openWebsite">Visit our website#!preference.10</span>
    </div>
  </TerminalPane>
</template>
