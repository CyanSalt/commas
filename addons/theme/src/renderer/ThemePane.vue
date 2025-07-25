<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { onMounted } from 'vue'
import ThemeCard from './ThemeCard.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import type { RemoteTheme } from './utils'
import { fetchThemeList } from './utils'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, VisualIcon, TerminalPane } = commas.ui.vueAssets

const keyword = $ref('')

let list = $ref<RemoteTheme[]>([])

const filteredList = $computed(() => {
  if (!keyword) return list
  const lowerCase = keyword.toLowerCase()
  return list.filter(item => item.name.toLowerCase().includes(lowerCase))
})

let isLightTheme = $(commas.remote.useIsLightTheme())
const settings = commas.remote.useSettings()

const currentTheme = $computed(() => {
  return isLightTheme ? settings['terminal.theme.lightName'] : settings['terminal.theme.name']
})

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

function openMarketplace(event: MouseEvent) {
  commas.ui.openLink('https://windowsterminalthemes.dev', event)
}

async function applyTheme(item: RemoteTheme) {
  if (item.name === currentTheme) return
  await commas.remote.writeUserFile(`themes/${item.name}.json`, JSON.stringify(item, null, 2))
  const isDark = item.meta.isDark
  if (isDark) {
    settings['terminal.theme.name'] = item.name
    if (isLightTheme) {
      settings['terminal.theme.type'] = 'dark'
    }
  } else {
    settings['terminal.theme.lightName'] = item.name
    if (!isLightTheme) {
      settings['terminal.theme.type'] = 'light'
    }
  }
}
</script>

<template>
  <TerminalPane :tab="tab" class="theme-pane">
    <h2 v-i18n data-commas>Configure Theme#!theme.2</h2>
    <form data-commas>
      <a v-i18n href="" data-commas @click.prevent="reset">Reset to default#!theme.4</a>
      <div data-commas class="color-list">
        <ThemeColorPicker v-for="field in fields" :key="field" :field="field" />
      </div>
      <div data-commas class="theme-searcher">
        <span class="searcher-bar" data-commas>
          <VisualIcon name="lucide-search" class="searcher-icon"></VisualIcon>
          <input
            v-model="keyword"
            v-i18n:placeholder
            type="search"
            placeholder="Find#!terminal.5"
            data-commas-alt
            class="searcher-control"
          >
        </span>
        <button type="button" data-commas @click="load">
          <VisualIcon name="lucide-refresh-cw" />
        </button>
        <div class="theme-source-tip">
          <span v-i18n>Theme will be downloaded from#!theme.3</span>
          <a href="" data-commas class="marketplace-link" @click.prevent="openMarketplace">windowsterminalthemes.dev</a>
        </div>
      </div>
      <div class="theme-list">
        <template v-if="!list.length">
          <ThemeCard
            v-for="i in 10"
            :key="i"
            disabled
          />
        </template>
        <template v-else>
          <ThemeCard
            v-for="item in filteredList"
            :key="item.name"
            :theme="item"
            :class="{ active: item.name === currentTheme }"
            @click="applyTheme(item)"
          />
        </template>
      </div>
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.color-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 24px;
}
:deep(.theme-color-picker label[data-commas]) {
  width: 10em;
}
.theme-searcher {
  width: 100%;
  margin: 12px 0;
}
.theme-source-tip {
  flex-basis: 100%;
  font-style: italic;
  font-size: 12px;
  &::before {
    content: '*';
    margin-right: 1ch;
  }
}
.searcher-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 50%;
}
.searcher-icon {
  opacity: 0.5;
}
.searcher-control {
  flex: 1;
  width: 0;
}
.theme-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  grid-gap: 24px;
  width: 100%;
  :deep(.theme-card):not(.skeleton) {
    &.active {
      outline: 2px solid rgb(var(--system-accent));
    }
  }
}
.theme-loading {
  margin: 12px 0;
}
.marketplace-link {
  margin-left: 0.5em;
}
</style>
