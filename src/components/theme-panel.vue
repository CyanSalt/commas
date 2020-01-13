<template>
  <internal-panel class="theme-panel">
    <h2 class="group-title" v-i18n>General#!8</h2>
    <div class="group">
      <div class="form-line">
        <label class="form-label" v-i18n>Apply theme#!19</label>
        <input type="text" v-model="theme.name" :placeholder="activeTheme"
          class="form-control">
        <span class="link form-action" @click="dress">
          <loading-spinner v-if="theme.loading"></loading-spinner>
          <span v-else class="feather-icon icon-download"></span>
        </span>
        <div class="form-line-tip">
          <span v-i18n>Theme will be downloaded from#!20</span>
          <span class="link" data-href="https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/windowsterminal"
            @click="open">mbadolato/iTerm2-Color-Schemes</span>
        </div>
      </div>
    </div>
  </internal-panel>
</template>

<script>
import InternalPanel from './internal-panel'
import LoadingSpinner from './loading-spinner'
import {mapState} from 'vuex'
import hooks from '@/hooks'

export default {
  name: 'ThemePanel',
  components: {
    'internal-panel': InternalPanel,
    'loading-spinner': LoadingSpinner,
  },
  data() {
    return {
      theme: {
        name: '',
        loading: false,
      },
    }
  },
  computed: {
    ...mapState('theme', {activeTheme: 'name'}),
  },
  methods: {
    open: hooks.shell.openExternalByEvent,
    async dress() {
      if (this.theme.loading || !this.theme.name) return
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
