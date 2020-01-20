<template>
  <span class="link proxy-link" @click="configure">
    <span v-i18n>Configure proxy rules#!24</span>
  </span>
</template>

<script>
import hooks from '@/hooks'

export default {
  name: 'ProxyLink',
  methods: {
    configure() {
      hooks.workspace.panel.open('proxy')
    },
  },
}
</script>
