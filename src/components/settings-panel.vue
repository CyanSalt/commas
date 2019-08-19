<template>
  <internal-panel class="settings-panel">
    <h2 class="group-title" v-i18n>General#!8</h2>
    <div class="group">
      <span class="link" @click="exec('open-user-directory')">
        <span class="feather-icon icon-folder"></span>
        <span v-i18n>Open user directory#!12</span>
      </span>
      <span class="link" @click="exec('open-settings')">
        <span class="feather-icon icon-settings"></span>
        <span v-i18n="{F: 'settings.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Feature#!9</h2>
    <div class="group">
      <span class="link" @click="exec('open-launchers')">
        <span class="feather-icon icon-play"></span>
        <span v-i18n="{F: 'launchers.json'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-proxy-rules')">
        <span class="feather-icon icon-navigation"></span>
        <span v-i18n="{F: 'proxy-rules.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Customization#!10</h2>
    <div class="group">
      <span class="link" @click="exec('open-keybindings')">
        <span class="feather-icon icon-command"></span>
        <span v-i18n="{F: 'keybindings.json'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-translation')">
        <span class="feather-icon icon-file-text"></span>
        <span v-i18n="{F: 'translation.json'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-custom-js')">
        <span class="feather-icon icon-code"></span>
        <span v-i18n="{F: 'custom.js'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-custom-css')">
        <span class="feather-icon icon-heart"></span>
        <span v-i18n="{F: 'custom.css'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>About#!11</h2>
    <div class="group">
      <span class="text" v-i18n="{V: version}">Current version: %V#!15</span>
      <span class="link" data-href="https://github.com/CyanSalt/commas" v-i18n
        @click="open">Visit our website#!14</span>
    </div>
  </internal-panel>
</template>

<script>
import InternalPanel from './internal-panel'
import {remote, shell} from 'electron'
import {mapActions} from 'vuex'

export default {
  name: 'SettingsPanel',
  components: {
    'internal-panel': InternalPanel,
  },
  data() {
    return {
      version: remote.app.getVersion(),
    }
  },
  methods: {
    ...mapActions('command', ['exec']),
    open(e) {
      shell.openExternal(e.target.dataset.href)
    },
  },
}
</script>
