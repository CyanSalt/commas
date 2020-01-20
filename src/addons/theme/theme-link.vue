<template>
  <span class="link theme-link" @click="configure('theme')">
    <span v-i18n>Configure theme#!28</span>
  </span>
</template>

<script>
import hooks from '@/hooks'

export default {
  name: 'ThemeLink',
  methods: {
    configure() {
      hooks.workspace.panel.open('theme')
    },
  },
}
</script>
