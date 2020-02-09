<template>
  <internal-panel class="theme-panel">
    <h2 class="group-title" v-i18n>Configure theme#!theme.2</h2>
    <div class="group">
      <span v-i18n class="link" @click="reset">Reset to default#!settings.12</span>
      <div class="form-line">
        <label class="form-label" v-i18n>Search#!settings.11</label>
        <input type="text" v-model="keyword" class="form-control">
        <div class="form-line-tip">
          <span v-i18n>Theme will be downloaded from#!theme.3</span>
          <span class="link" data-href="https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/windowsterminal"
            @click="open">mbadolato/iTerm2-Color-Schemes</span>
        </div>
      </div>
      <loading-spinner v-if="!list.length" class="theme-loading"></loading-spinner>
      <div v-else class="theme-list">
        <div v-for="item in filtered" :key="item.name" class="theme-item">
          <img class="theme-screenshot" :src="item.screenshot">
          <div class="theme-action">
            <span class="theme-name">{{ item.name }}</span>
            <span v-if="item.name !== name" class="link" @click="apply(item)">
              <loading-spinner v-if="loading === item.name"></loading-spinner>
              <span v-else class="feather-icon icon-check"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </internal-panel>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import {getThemeList} from './utils'
import hooks from '@/hooks'

export default {
  name: 'ThemePanel',
  components: {
    ...hooks.workspace.component.pick([
      'internal-panel',
      'loading-spinner',
    ]),
  },
  data() {
    return {
      keyword: '',
      loading: false,
      list: [],
    }
  },
  computed: {
    ...mapState('theme', ['name']),
    ...mapGetters('settings', ['fallback']),
    filtered() {
      if (!this.keyword) return this.list
      return this.list.filter(item => item.name.indexOf(this.keyword) !== -1)
    },
  },
  async created() {
    try {
      this.list = await getThemeList()
    } catch {
      // ignore error
    }
  },
  methods: {
    open: hooks.shell.openExternalByEvent,
    async apply(item) {
      if (this.loading) return
      this.loading = item.name
      const result = await hooks.storage.user.download(
        `themes/${item.name}.json`,
        item.url,
      )
      if (result) {
        await this.$store.dispatch('settings/update', {
          'terminal.theme.name': item.name,
        })
      }
      this.loading = false
    },
    reset() {
      this.$store.dispatch('settings/update', {
        'terminal.theme.name': this.fallback['terminal.theme.name'],
      })
    },
  },
}
</script>

<style>
.theme-panel .theme-list {
  padding: 12px 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  grid-gap: 24px;
}
.theme-panel .theme-item {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}
.theme-panel .theme-item::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--theme-foreground);
  opacity: 0.1;
  z-index: -1;
}
.theme-panel .theme-screenshot {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.theme-panel .theme-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 48px;
}
.theme-panel .theme-loading {
  margin: 12px 0;
}
</style>
