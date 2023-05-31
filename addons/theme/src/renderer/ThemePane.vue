<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { shell, ipcRenderer } from 'electron'
import { onMounted } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import ThemeCard from './ThemeCard.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import type { RemoteTheme } from './utils'
import { fetchThemeList } from './utils'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, LoadingSpinner, TerminalPane } = commas.ui.vueAssets

const keyword: string = $ref('')

let list = $ref<RemoteTheme[]>([])

const filteredList = $computed(() => {
  if (!keyword) return list
  const lowerCase = keyword.toLowerCase()
  return list.filter(item => item.name.toLowerCase().includes(lowerCase))
})

const settings = commas.remote.useSettings()

const currentTheme = $computed(() => settings['terminal.theme.name'])

const fields = [
  'foreground',
  'background',
  'black',
  'brightBlack',
  'red',
  'brightRed',
  'green',
  'brightGreen',
  'yellow',
  'brightYellow',
  'blue',
  'brightBlue',
  'magenta',
  'brightMagenta',
  'cyan',
  'brightCyan',
  'white',
  'brightWhite',
]

async function load() {
  list = []
  list = await fetchThemeList()
}

onMounted(() => {
  load()
})

function reset() {
  ipcRenderer.invoke('reset-theme')
}

function openMarketplace() {
  shell.openExternal('https://windowsterminalthemes.dev')
}

async function applyTheme(item: RemoteTheme) {
  await commas.remote.writeUserFile(`themes/${item.name}.json`, JSON.stringify(item, null, 2))
  settings['terminal.theme.name'] = item.name
}
</script>

<template>
  <TerminalPane class="theme-pane">
    <h2 v-i18n class="group-title">Configure Theme#!theme.2</h2>
    <div class="group">
      <div class="form-line">
        <span v-i18n class="link" @click="reset">Reset to default#!preference.11</span>
      </div>
      <div class="form-line color-list">
        <ThemeColorPicker v-for="field in fields" :key="field" :field="field" />
      </div>
      <div class="form-line theme-searcher">
        <input
          v-model="keyword"
          v-i18n:placeholder
          type="search"
          placeholder="Find#!terminal.5"
          class="form-control"
        >
        <span class="link form-action" @click="load">
          <span class="ph-bold ph-arrows-clockwise"></span>
        </span>
        <div class="form-line-tip">
          <span v-i18n>Theme will be downloaded from#!theme.3</span>
          <span class="link marketplace-link" @click="openMarketplace">windowsterminalthemes.dev</span>
        </div>
      </div>
      <LoadingSpinner v-if="!list.length" class="theme-loading" />
      <div v-else class="theme-list">
        <ThemeCard v-for="item in filteredList" :key="item.name" :theme="item">
          <span v-if="item.name !== currentTheme" class="link" @click="applyTheme(item)">
            <span class="ph-bold ph-check"></span>
          </span>
        </ThemeCard>
      </div>
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.color-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 24px;
}
:deep(.theme-color-picker) .form-label {
  width: 10em;
}
.theme-searcher {
  width: 100%;
  .form-control {
    width: 50%;
  }
  .form-line-tip {
    margin-top: 8px;
  }
}
.theme-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  grid-gap: 24px;
  width: 100%;
  padding: 12px 0;
}
.theme-loading {
  margin: 12px 0;
}
.marketplace-link {
  margin-left: 0.5em;
}
</style>
