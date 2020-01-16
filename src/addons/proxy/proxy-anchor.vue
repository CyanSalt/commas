<template>
  <div :class="['proxy-anchor', {active: port}]" @click="toggle">
    <span class="feather-icon icon-navigation"></span>
    <span v-if="port" class="server-port">{{ port }}</span>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'ProxyAnchor',
  computed: {
    ...mapState('proxy', ['port']),
  },
  methods: {
    toggle() {
      if (this.port) {
        this.$store.dispatch('proxy/close')
      } else {
        this.$store.dispatch('proxy/open')
      }
    },
  },
}
</script>

<style>
.proxy-anchor.active {
  color: var(--design-cyan);
}
</style>
