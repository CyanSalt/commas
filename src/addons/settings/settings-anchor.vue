<template>
  <div class="settings-anchor" @click="configure">
    <span class="feather-icon icon-settings"></span>
  </div>
</template>

<script>
import hooks from '@/hooks'

export default {
  name: 'SettingsAnchor',
  methods: {
    configure() {
      return hooks.workspace.panel.open('settings')
    },
  },
}
</script>
