<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure theme#!theme.2</span>
  </span>
</template>

<script>
import hooks from '@commas/hooks'

export default {
  name: 'ThemeLink',
  methods: {
    configure() {
      hooks.workspace.panel.open('theme')
    },
  },
}
</script>
