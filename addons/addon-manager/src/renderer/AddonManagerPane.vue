<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import type { AddonInfo } from '@commas/types/addon'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { onMounted, watchEffect } from 'vue'
import { useDiscoveredAddons } from './compositions'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, VisualIcon, TerminalPane, SwitchControl } = commas.ui.vueAssets

const settings = commas.remote.useSettings()

const discoveredAddons = $(useDiscoveredAddons())

let enabledAddons = $computed<string[]>({
  get() {
    return settings['terminal.addon.includes']
  },
  set(value) {
    ipcRenderer.invoke('set-addons', value)
  },
})

let isBuiltinAddonsVisible = $ref(false)

watchEffect(() => {
  if (discoveredAddons.length && discoveredAddons.every(addon => addon.type === 'builtin')) {
    isBuiltinAddonsVisible = true
  }
})

const addonList = $computed(() => {
  return discoveredAddons
    .filter(addon => {
      if (!isBuiltinAddonsVisible && addon.type === 'builtin') return false
      return true
    })
    .map(addon => ({
      addon,
      manifest: commas.remote.getI18nManifest(addon.manifest),
      enabled: enabledAddons.includes(addon.name),
    }))
})

function toggle(addon: AddonInfo, enabled: boolean) {
  const addons = enabledAddons
    .filter(item => item !== addon.name)
  if (enabled) {
    addons.push(addon.name)
  }
  enabledAddons = addons
}

function refresh() {
  ipcRenderer.invoke('discover-addons')
}

function showInFolder(addon: AddonInfo) {
  if (addon.type === 'builtin') return
  commas.remote.showFileExternally(addon.entry)
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <TerminalPane :tab="tab" class="addon-manager-pane">
    <h2 v-i18n data-commas>Addons#!addon-manager.1</h2>
    <form class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Show Built-in Addons#!addon-manager.4</label>
        <SwitchControl v-model="isBuiltinAddonsVisible" />
      </div>
      <div class="action-line">
        <button type="button" data-commas @click="refresh">
          <VisualIcon name="lucide-refresh-cw" />
        </button>
      </div>
      <div class="addon-list">
        <div
          v-for="({ addon, manifest, enabled }) in addonList"
          :key="addon.name"
          :class="['addon-card', { 'is-disabled': !enabled }]"
        >
          <div class="addon-icon">
            <VisualIcon
              v-if="manifest['commas:icon']"
              :name="manifest['commas:icon'].name"
              :style="{ color: manifest['commas:icon'].color }"
            />
          </div>
          <div class="addon-info">
            <div class="addon-title">
              <span class="addon-primary-info">
                <span class="addon-name">{{ manifest.productName ?? manifest.name ?? addon.name }}</span>
                <template v-if="(manifest.productName ?? manifest.name) !== addon.name">
                  <a
                    v-if="addon.type !== 'builtin'"
                    href=""
                    data-commas
                    class="addon-id"
                    @click.prevent="showInFolder(addon)"
                  >{{ addon.name }}</a>
                  <span v-else class="addon-id">{{ addon.name }}</span>
                </template>
                <span v-if="addon.type !== 'builtin'" class="addon-version">{{ manifest.version ?? '' }}</span>
              </span>
              <SwitchControl
                :model-value="enabled"
                @update:model-value="toggle(addon, $event)"
              />
            </div>
            <div class="addon-description">{{ manifest.description ?? '' }}</div>
            <span v-if="addon.type === 'builtin'" v-i18n class="addon-tag">Built-in#!addon-manager.3</span>
            <span v-else class="addon-author">{{ manifest.author ?? '' }}</span>
          </div>
        </div>
      </div>
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.addon-list {
  width: 100%;
  max-width: 50vw;
  margin-top: 8px;
}
.addon-card {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  &.is-disabled {
    color: rgb(var(--theme-foreground) / 50%);
  }
}
.addon-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  color: rgb(var(--system-accent));
  font-size: 24px;
  background: var(--design-highlight-background);
  border-radius: 8px;
}
.addon-info {
  flex: 1;
  min-width: 0;
  line-height: 24px;
}
.addon-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.addon-primary-info {
  display: flex;
  align-items: center;
}
.addon-name {
  font-weight: bold;
}
.addon-id,
.addon-version {
  margin-left: 1em;
  color: rgb(var(--theme-foreground) / 50%);
  font-size: 12px;
  opacity: 1;
}
.addon-tag {
  color: rgb(var(--system-green));
  font-size: 12px;
}
.addon-author {
  font-size: 12px;
}
</style>
