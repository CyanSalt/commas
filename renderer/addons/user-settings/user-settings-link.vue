<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure User Settings#!user-settings.2</span>
  </span>
</template>

<script>
import hooks from '@commas/hooks'

export default {
  name: 'UserSettingsLink',
  methods: {
    configure() {
      hooks.workspace.panel.open('user-settings')
    },
  },
}
</script>
