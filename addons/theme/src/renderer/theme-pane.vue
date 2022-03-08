<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { shell, ipcRenderer } from 'electron'
import { fetchThemeList } from './utils'
import type { ThemeEntry } from './utils'

const { vI18n, LoadingSpinner, TerminalPane } = commas.ui.vueAssets

let loading = $ref<string | false>(false)
const keyword = $ref('')

const list = $(commas.helperRenderer.useAsyncComputed(() => fetchThemeList(), []))

const filteredList = $computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!keyword) return list
  return list.filter(item => item.name.includes(keyword))
})

let userSettings = $(commas.remote.useUserSettings())

const currentTheme = $computed<string>(() => {
  return userSettings['terminal.theme.name']
})

const themeType = $computed({
  get() {
    return userSettings['terminal.theme.customization']?.type ?? ''
  },
  set(value) {
    if (!value) {
      value = undefined
    }
    let customization = {
      ...userSettings['terminal.theme.customization'],
      type: value,
    }
    if (!value && Object.keys(customization).length <= 1) {
      customization = undefined
    }
    userSettings = {
      ...userSettings,
      'terminal.theme.customization': customization,
    }
  },
})

function updateTheme(name: string) {
  userSettings = {
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (loading) return
  loading = item.name
  const result = await ipcRenderer.invoke(
    'download-user-file',
    `themes/${item.name}.json`,
    item.url,
  )
  if (result) {
    updateTheme(item.name)
  }
  loading = false
}
</script>

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
          <span class="link github-link" @click="openMarketplace">mbadolato/iTerm2-Color-Schemes</span>
        </div>
      </div>
      <LoadingSpinner v-if="!list.length" class="theme-loading" />
      <div v-else class="theme-list">
        <figure v-for="item in filteredList" :key="item.name" class="theme-item">
          <img class="theme-screenshot" :src="item.screenshot">
          <figcaption class="theme-action">
            <span class="theme-name">{{ item.name }}</span>
            <span v-if="item.name !== currentTheme" class="link" @click="applyItem(item)">
              <LoadingSpinner v-if="loading === item.name" />
              <span v-else class="feather-icon icon-check"></span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  </TerminalPane>
</template>

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
  margin: 0;
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
.github-link {
  margin-left: 0.5em;
}
</style>
