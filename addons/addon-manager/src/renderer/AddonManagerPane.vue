<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue'
import type { AddonInfo } from '../../../../src/typings/addon'
import { useDiscoveredAddons } from './compositions'

const { vI18n, TerminalPane, SwitchControl } = commas.ui.vueAssets

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
      manifest: commas.remote.getAddonManifest(addon.manifest),
      enabled: enabledAddons.includes(addon.name),
    }))
    .sort((a, b) => Number(b.enabled) - Number(a.enabled))
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

onMounted(() => {
  refresh()
})
</script>

<template>
  <TerminalPane class="addon-manager-pane">
    <h2 v-i18n class="group-title">Addons#!addon-manager.1</h2>
    <form class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Show Built-in Addons#!addon-manager.4</label>
        <SwitchControl v-model="isBuiltinAddonsVisible" />
      </div>
      <div class="action-line">
        <span class="link form-action" @click="refresh">
          <span class="feather-icon icon-refresh-cw"></span>
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
                class="addon-id"
              >{{ addon.name }}</span>
              <span v-if="addon.type !== 'builtin'" class="addon-version">{{ manifest.version ?? '' }}</span>
            </span>
            <span class="link form-action">
              <span
                :class="['feather-icon', enabled ? 'icon-zap-off' : 'icon-zap']"
                @click="toggle(addon, !enabled)"
              ></span>
            </span>
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
  .form-action {
    color: rgb(var(--system-red));
    .addon-card.is-disabled & {
      color: rgb(var(--system-yellow));
    }
  }
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
}
.addon-tag {
  color: rgb(var(--theme-green));
  font-size: 12px;
}
.addon-author {
  font-size: 12px;
}
</style>
