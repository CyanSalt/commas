<template>
  <div class="settings-panel">
    <div class="pattern">$,,,</div>
    <div class="scroll-area">
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
        <span class="link" v-i18n @click="visit">Visit our website#!14</span>
      </div>
    </div>
    <scroll-bar></scroll-bar>
  </div>
</template>

<script>
import ScrollBar from './scroll-bar'
import {remote, shell} from 'electron'
import {mapActions} from 'vuex'

export default {
  name: 'SettingsPanel',
  components: {
    'scroll-bar': ScrollBar,
  },
  data() {
    return {
      version: remote.app.getVersion(),
    }
  },
  methods: {
    ...mapActions('command', ['exec']),
    visit() {
      shell.openExternal(`https://github.com/CyanSalt/commas`)
    },
  },
}
</script>

<style>
.settings-panel {
  position: relative;
  padding: 4px 24px;
  height: 100%;
  box-sizing: border-box;
}
.settings-panel .pattern {
  position: absolute;
  width: 128px;
  height: 128px;
  line-height: 128px;
  bottom: 24px;
  right: 24px;
  font-size: 56px;
  border-radius: 16px;
  text-align: center;
  font-family: 'Oxygen';
  font-weight: bold;
  color: var(--theme-background);
  background: var(--theme-foreground);
  opacity: 0.1;
}
.settings-panel .scroll-area {
  height: 100%;
  overflow: auto;
}
.settings-panel .scroll-area::-webkit-scrollbar {
  width: 0px;
}
.settings-panel .scroll-area :last-child {
  margin-bottom: 16px;
}
.settings-panel .group-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  line-height: 24px;
}
.settings-panel .group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.settings-panel .link {
  line-height: 32px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.settings-panel .link:hover {
  /* text-decoration: underline; */
  opacity: 1;
}
.settings-panel .link .feather-icon {
  margin-left: 4px;
}
.settings-panel .text {
  line-height: 32px;
}
</style>
