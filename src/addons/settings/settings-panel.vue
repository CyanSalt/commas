<template>
  <internal-panel class="settings-panel">
    <h2 class="group-title" v-i18n>General#!8</h2>
    <div class="group">
      <component v-for="(item, index) in slots.general"
        :is="item.component" :key="index"></component>
      <span class="link" @click="exec('open-user-directory')">
        <span v-i18n>Open user directory#!12</span>
      </span>
      <span class="link" @click="exec('open-default-settings')">
        <span v-i18n>Open default settings#!26</span>
      </span>
      <span class="link" @click="exec('open-settings')">
        <span v-i18n="{F: 'settings.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Feature#!9</h2>
    <div class="group">
      <component v-for="(item, index) in slots.feature"
        :is="item.component" :key="index"></component>
      <span class="link" @click="exec('open-launchers')">
        <span v-i18n="{F: 'launchers.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Customization#!10</h2>
    <div class="group">
      <component v-for="(item, index) in slots.customization"
        :is="item.component" :key="index"></component>
      <span class="link" @click="exec('open-keybindings')">
        <span v-i18n="{F: 'keybindings.json'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-translation')">
        <span v-i18n="{F: 'translation.json'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-custom-js')">
        <span v-i18n="{F: 'custom.js'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-custom-css')">
        <span v-i18n="{F: 'custom.css'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>About#!11</h2>
    <div class="group">
      <component v-for="(item, index) in slots.about"
        :is="item.component" :key="index"></component>
      <div class="form-line">
        <label class="form-label" v-i18n>Enable auto updating#!22</label>
        <switch-control :checked="updaterEnabled" @change="toggleUpdaterEnabled"></switch-control>
      </div>
      <span class="text" v-i18n="{V: version}">Current version: %V#!15</span>
      <span class="link" data-href="https://github.com/CyanSalt/commas" v-i18n
        @click="open">Visit our website#!14</span>
    </div>
  </internal-panel>
</template>

<script>
import {remote} from 'electron'
import {mapActions, mapState} from 'vuex'
import hooks from '@/hooks'

export default {
  name: 'SettingsPanel',
  components: {
    'internal-panel': hooks.workspace.components.InternalPanel,
    'switch-control': hooks.workspace.components.SwitchControl,
  },
  data() {
    return {
      version: remote.app.getVersion(),
      list: hooks.addon.data.get('settings'),
    }
  },
  computed: {
    ...mapState('updater', {updaterEnabled: 'enabled'}),
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
    ...mapActions('updater', {toggleUpdaterEnabled: 'toggle'}),
    exec: hooks.command.exec,
    open: hooks.shell.openExternalByEvent,
    divide(group) {
      const list = this.list.filter(item => item.group === group)
      return [...list].sort((a, b) => (a.priority || 0) - (b.priority || 0))
    },
  },
}
</script>
