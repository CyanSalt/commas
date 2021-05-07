<template>
  <terminal-pane class="theme-pane">
    <h2 v-i18n class="group-title">Configure theme#!theme.2</h2>
    <div class="group">
      <span v-i18n class="link" @click="reset">Reset to default#!preference.12</span>
      <div class="form-line">
        <label v-i18n class="form-label">Search#!preference.11</label>
        <input v-model="keyword" type="text" class="form-control">
        <div class="form-line-tip">
          <span v-i18n>Theme will be downloaded from#!theme.3</span>
          <span class="link" @click="openMarketplace">mbadolato/iTerm2-Color-Schemes</span>
        </div>
      </div>
      <loading-spinner v-if="!list.length" class="theme-loading"></loading-spinner>
      <div v-else class="theme-list">
        <div v-for="item in filteredList" :key="item.name" class="theme-item">
          <img class="theme-screenshot" :src="item.screenshot">
          <div class="theme-action">
            <span class="theme-name">{{ item.name }}</span>
            <span v-if="item.name !== currentTheme" class="link" @click="applyItem(item)">
              <loading-spinner v-if="loading === item.name"></loading-spinner>
              <span v-else class="feather-icon icon-check"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </terminal-pane>
</template>

<script lang="ts">
import { shell, ipcRenderer } from 'electron'
import { reactive, toRefs, unref, computed, watchEffect } from 'vue'
import LoadingSpinner from '../../../renderer/components/basic/loading-spinner.vue'
import TerminalPane from '../../../renderer/components/basic/terminal-pane.vue'
import { useUserSettings } from '../../../renderer/hooks/settings'
import type { ThemeEntry } from './utils'
import { fetchThemeList } from './utils'

export default {
  name: 'theme-pane',
  components: {
    'terminal-pane': TerminalPane,
    'loading-spinner': LoadingSpinner,
  },
  setup() {
    const state = reactive({
      loading: false as string | false,
      keyword: '',
      list: [] as ThemeEntry[],
    })

    watchEffect(async () => {
      try {
        state.list = await fetchThemeList()
      } catch {
        // ignore error
      }
    })

    const filteredListRef = computed(() => {
      if (!state.keyword) return state.list
      return state.list.filter(item => item.name.includes(state.keyword))
    })

    const userSettingsRef = useUserSettings()
    const currentThemeRef = computed<string>(() => {
      const settings = unref(userSettingsRef)
      return settings['terminal.theme.name']
    })

    function updateTheme(name: string) {
      const userSettings = unref(userSettingsRef)
      userSettingsRef.value = {
        ...userSettings,
        'terminal.theme.name': name,
      }
    }

    function reset() {
      updateTheme('oceanic-next')
    }

    function openMarketplace() {
      shell.openExternal('https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/windowsterminal')
    }

    async function applyItem(item: ThemeEntry) {
      if (state.loading) return
      state.loading = item.name
      const result = await ipcRenderer.invoke(
        'download-user-file',
        `themes/${item.name}.json`,
        item.url,
      )
      if (result) {
        updateTheme(item.name)
      }
      state.loading = false
    }

    return {
      ...toRefs(state),
      filteredList: filteredListRef,
      currentTheme: currentThemeRef,
      reset,
      openMarketplace,
      applyItem,
    }
  },
}
</script>

<style lang="scss" scoped>
.theme-list {
  padding: 12px 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  grid-gap: 24px;
}
.theme-item {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  background: rgb(var(--theme-foreground) / 0.1);
}
.theme-screenshot {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.theme-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 48px;
}
.theme-loading {
  margin: 12px 0;
}
</style>
