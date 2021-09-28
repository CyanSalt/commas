<template>
  <TerminalPane class="theme-pane">
    <h2 v-i18n class="group-title">Configure theme#!theme.2</h2>
    <div class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Dark Mode#!theme.4</label>
        <select v-model="themeType" class="form-control">
          <option v-i18n value="">Follow Theme#!theme.5</option>
          <option v-i18n value="light">Light#!theme.6</option>
          <option v-i18n value="dark">Dark#!theme.7</option>
        </select>
      </div>
      <span v-i18n class="link" @click="reset">Reset to default#!preference.12</span>
      <div class="form-line">
        <label v-i18n class="form-label">Search#!preference.11</label>
        <input v-model="keyword" type="search" class="form-control">
        <div class="form-line-tip">
          <span v-i18n>Theme will be downloaded from#!theme.3</span>
          <span class="link" @click="openMarketplace">mbadolato/iTerm2-Color-Schemes</span>
        </div>
      </div>
      <LoadingSpinner v-if="!list.length" class="theme-loading" />
      <div v-else class="theme-list">
        <div v-for="item in filteredList" :key="item.name" class="theme-item">
          <img class="theme-screenshot" :src="item.screenshot">
          <div class="theme-action">
            <span class="theme-name">{{ item.name }}</span>
            <span v-if="item.name !== currentTheme" class="link" @click="applyItem(item)">
              <LoadingSpinner v-if="loading === item.name" />
              <span v-else class="feather-icon icon-check"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </TerminalPane>
</template>

<script lang="ts">
import { shell, ipcRenderer } from 'electron'
import { computed, ref, unref } from 'vue'
import LoadingSpinner from '../../../renderer/components/basic/loading-spinner.vue'
import TerminalPane from '../../../renderer/components/basic/terminal-pane.vue'
import { useUserSettings } from '../../../renderer/hooks/settings'
import { useAsyncComputed } from '../../../renderer/utils/hooks'
import { fetchThemeList } from './utils'
import type { ThemeEntry } from './utils'

export default {
  name: 'theme-pane',
  components: {
    TerminalPane,
    LoadingSpinner,
  },
  setup() {
    const loadingRef = ref<string | false>(false)
    const keywordRef = ref('')

    const listRef = useAsyncComputed(() => fetchThemeList(), [])

    const filteredListRef = computed(() => {
      const list = unref(listRef)
      const keyword = unref(keywordRef)
      if (!keyword) return list
      return list.filter(item => item.name.includes(keyword))
    })

    const userSettingsRef = useUserSettings()
    const currentThemeRef = computed<string>(() => {
      const settings = unref(userSettingsRef)
      return settings['terminal.theme.name']
    })

    const themeTypeRef = computed({
      get() {
        const userSettings = unref(userSettingsRef)
        return userSettings['terminal.theme.customization']?.type ?? ''
      },
      set(value) {
        if (!value) {
          value = undefined
        }
        const userSettings = unref(userSettingsRef)
        let customization = {
          ...userSettings['terminal.theme.customization'],
          type: value,
        }
        if (!value && Object.keys(customization).length <= 1) {
          customization = undefined
        }
        userSettingsRef.value = {
          ...userSettings,
          'terminal.theme.customization': customization,
        }
      },
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
      const loading = unref(loadingRef)
      if (loading) return
      loadingRef.value = item.name
      const result = await ipcRenderer.invoke(
        'download-user-file',
        `themes/${item.name}.json`,
        item.url,
      )
      if (result) {
        updateTheme(item.name)
      }
      loadingRef.value = false
    }

    return {
      loading: loadingRef,
      keyword: keywordRef,
      list: listRef,
      filteredList: filteredListRef,
      currentTheme: currentThemeRef,
      themeType: themeTypeRef,
      reset,
      openMarketplace,
      applyItem,
    }
  },
}
</script>

<style lang="scss" scoped>
.theme-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  grid-gap: 24px;
  width: 100%;
  padding: 12px 0;
}
.theme-item {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(var(--theme-foreground) / 0.1);
  border-radius: 4px;
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
  height: 48px;
  padding: 0 12px;
}
.theme-loading {
  margin: 12px 0;
}
</style>
