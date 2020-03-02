<template>
  <internal-panel class="settings-panel">
    <h2 v-i18n class="group-title">General#!settings.2</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in slots.general"
        :key="index"
      ></component>
      <span class="link" @click="exec('open-user-directory')">
        <span v-i18n>Open user directory#!settings.6</span>
      </span>
      <span class="link" @click="exec('open-default-settings')">
        <span v-i18n>Open default settings#!settings.7</span>
      </span>
      <span class="link" @click="exec('open-settings')">
        <span v-i18n="{F: 'settings.json'}">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Features#!settings.3</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in slots.feature"
        :key="index"
      ></component>
      <span class="link" @click="exec('open-launchers')">
        <span v-i18n="{F: 'launchers.json'}">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">Customization#!settings.4</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in slots.customization"
        :key="index"
      ></component>
      <span class="link" @click="exec('open-keybindings')">
        <span v-i18n="{F: 'keybindings.json'}">Edit %F#!settings.8</span>
      </span>
      <span class="link" @click="exec('open-translation')">
        <span v-i18n="{F: 'translation.json'}">Edit %F#!settings.8</span>
      </span>
      <span class="link" @click="exec('open-custom-js')">
        <span v-i18n="{F: 'custom.js'}">Edit %F#!settings.8</span>
      </span>
      <span class="link" @click="exec('open-custom-css')">
        <span v-i18n="{F: 'custom.css'}">Edit %F#!settings.8</span>
      </span>
    </div>
    <h2 v-i18n class="group-title">About#!settings.5</h2>
    <div class="group">
      <component
        :is="item.component"
        v-for="(item, index) in slots.about"
        :key="index"
      ></component>
      <span v-i18n="{V: version}" class="text">Current version: %V#!settings.9</span>
      <span
        v-i18n
        class="link"
        data-href="https://github.com/CyanSalt/commas"
        @click="open"
      >Visit our website#!settings.10</span>
    </div>
  </internal-panel>
</template>

<script>
import {remote} from 'electron'
import hooks from '@hooks'

export default {
  name: 'SettingsPanel',
  components: {
    ...hooks.workspace.component.pick([
      'internal-panel',
      'switch-control',
    ]),
  },
  data() {
    return {
      version: remote.app.getVersion(),
      list: hooks.addon.data.get('settings:slots'),
    }
  },
  computed: {
    slots() {
      return {
        general: this.divide('general'),
        feature: this.divide('feature'),
        customization: this.divide('customization'),
        about: this.divide('about'),
      }
    },
  },
  methods: {
    exec: hooks.command.exec,
    open: hooks.shell.openExternalByEvent,
    divide(group) {
      const list = this.list.filter(item => item.group === group)
      return [...list].sort((a, b) => (a.priority || 0) - (b.priority || 0))
    },
  },
}
</script>
