<template>
  <internal-panel class="settings-panel">
    <h2 class="group-title" v-i18n>General#!8</h2>
    <div class="group">
      <div class="form-line">
        <label class="form-label" v-i18n>Apply theme#!19</label>
        <input type="text" v-model="theme.name" :placeholder="activeTheme"
          class="form-control">
        <span :class="['link form-action', {loading: theme.loading}]" @click="dress">
          <span class="feather-icon icon-download"></span>
        </span>
        <div class="form-line-tip">
          <span v-i18n>Theme will be downloaded from#!20</span>
          <span class="link" data-href="https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/windowsterminal"
            @click="open">mbadolato/iTerm2-Color-Schemes</span>
        </div>
      </div>
      <span class="link" @click="exec('open-user-directory')">
        <span v-i18n>Open user directory#!12</span>
      </span>
      <span class="link" @click="exec('open-settings')">
        <span v-i18n="{F: 'settings.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Feature#!9</h2>
    <div class="group">
      <span class="link" @click="exec('open-launchers')">
        <span v-i18n="{F: 'launchers.json'}">Edit %F#!13</span>
      </span>
      <span class="link" @click="exec('open-proxy-rules')">
        <span v-i18n="{F: 'proxy-rules.json'}">Edit %F#!13</span>
      </span>
    </div>
    <h2 class="group-title" v-i18n>Customization#!10</h2>
    <div class="group">
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
      <span class="text" v-i18n="{V: version}">Current version: %V#!15</span>
      <span class="link" data-href="https://github.com/CyanSalt/commas" v-i18n
        @click="open">Visit our website#!14</span>
    </div>
  </internal-panel>
</template>

<script>
import InternalPanel from './internal-panel'
import {remote, shell} from 'electron'
import {mapActions, mapState} from 'vuex'

export default {
  name: 'SettingsPanel',
  components: {
    'internal-panel': InternalPanel,
  },
  data() {
    return {
      theme: {
        name: '',
        loading: false,
      },
      version: remote.app.getVersion(),
    }
  },
  computed: {
    ...mapState('theme', {activeTheme: 'name'}),
  },
  methods: {
    ...mapActions('command', ['exec']),
    open(e) {
      shell.openExternal(e.target.dataset.href)
    },
    async dress() {
      if (!this.theme.name) return
      this.theme.loading = true
      await this.$store.dispatch('theme/apply', {
        name: this.theme.name,
        download: true,
      })
      this.theme.loading = false
    },
  },
}
</script>
