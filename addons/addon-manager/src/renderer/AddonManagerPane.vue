<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import { onMounted } from 'vue'
import type { AddonInfo } from '../../../../src/typings/addon'
import type { TerminalTab } from '../../../../src/typings/terminal'
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

let isBuiltinAddonsVisible: boolean = $ref(false)

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
  shell.showItemInFolder(addon.entry)
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <TerminalPane :tab="tab" class="addon-manager-pane">
    <h2 v-i18n class="group-title">Addons#!addon-manager.1</h2>
    <form class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Show Built-in Addons#!addon-manager.4</label>
        <SwitchControl v-model="isBuiltinAddonsVisible" />
      </div>
      <div class="action-line">
        <span class="link form-action" @click="refresh">
          <VisualIcon name="lucide-refresh-cw" />
        </span>
      </div>
      <div class="addon-list">
        <div
          v-for="({ addon, manifest, enabled }) in addonList"
          :key="addon.name"
          :class="['addon-card', { 'is-disabled': !enabled }]"
        >
          <div class="addon-card-title">
            <span class="addon-primary-info">
              <span class="addon-name">{{ manifest.productName ?? manifest.name ?? addon.name }}</span>
              <span
                v-if="(manifest.productName ?? manifest.name) !== addon.name"
                :class="['addon-id', { link: addon.type !== 'builtin' }]"
                @click="showInFolder(addon)"
              >{{ addon.name }}</span>
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
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.form-action {
  margin: 0;
}
.addon-list {
  width: 100%;
  max-width: 50vw;
  margin-top: 8px;
}
.addon-card {
  padding: 8px 0;
  border-top: 1px solid var(--design-separator);
  line-height: 24px;
  &.is-disabled {
    color: rgb(var(--theme-foreground) / 0.5);
  }
}
.addon-card-title {
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
  color: rgb(var(--theme-foreground) / 0.5);
  font-size: 12px;
  opacity: 1;
}
.addon-tag {
  color: rgb(var(--theme-green));
  font-size: 12px;
}
.addon-author {
  font-size: 12px;
}
</style>
