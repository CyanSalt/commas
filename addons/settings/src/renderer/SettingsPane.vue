<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { startCase } from 'lodash'
import { Component, nextTick, onBeforeUpdate, watchEffect } from 'vue'
import SettingsLine from './SettingsLine.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, VisualIcon, TerminalPane } = commas.ui.vueAssets

const settingsItems = commas.context.getCollection('settings.item')

const settingsComponents = $computed(() => {
  return new Map<string, Component>(settingsItems.map(item => [item.key, item.component]))
})

const keyword = $ref('')

const settings = commas.remote.useSettings()
let open = $ref<Record<string, boolean>>({})
let lines: Record<string, HTMLElement | undefined> = {}

const specs = $(commas.remote.useSettingsSpecs())
const configurableSpecs = $computed(() => {
  return specs.filter((item) => {
    return !Array.isArray(item.configurable)
      || item.configurable.includes(process.platform)
  })
})

const addons = $(commas.remote.useAddons())

const groups = $computed(() => {
  return Object.entries(Object.groupBy(configurableSpecs, spec => {
    const domain = spec.key.split('.')
    return domain.slice(0, domain[0] === 'terminal' ? 2 : 1).join('.')
  })).map(([key, rows]) => {
    let from: string | undefined
    let name: string
    const domain = key.split('.')
    if (domain[0] === 'terminal') {
      name = startCase(domain[1])
    } else {
      name = startCase(key)
      const addon = addons.find(item => item.name === domain[0])
      if (addon) {
        const manifest = commas.remote.getI18nManifest(addon.manifest)
        from = manifest.productName ?? manifest.name ?? addon.name
      }
    }
    return {
      key,
      name,
      from,
      rows: rows!.filter(row => commas.helper.matches([row.key, commas.remote.translate(row.label)], keyword)),
    }
  }).filter(group => group.rows.length)
})

watchEffect(async () => {
  if (!specs.length) return
  const id = tab.command
  if (id) {
    // eslint-disable-next-line vue/no-mutating-props
    delete tab.command
    await nextTick()
    lines[id]?.scrollIntoView(true)
  }
})

watchEffect(() => {
  open = configurableSpecs.reduce((record, spec) => {
    record[spec.key] = true
    return record
  }, {})
})

let isCollapsed = $computed({
  get() {
    return Object.values(open).every(item => !item)
  },
  set(value) {
    Object.keys(open).forEach(key => {
      open[key] = !value
    })
  },
})

function toggleAll() {
  isCollapsed = !isCollapsed
}

onBeforeUpdate(() => {
  lines = {}
})
</script>

<template>
  <TerminalPane :tab="tab" class="settings-pane">
    <h2 v-i18n class="group-title">Settings#!settings.1</h2>
    <form class="group">
      <div class="action-line settings-searcher">
        <span :class="['link form-action toggle-all', { collapsed: isCollapsed }]" @click="toggleAll">
          <VisualIcon name="lucide-chevrons-down" class="toggle-all-icon" />
        </span>
        <input
          v-model="keyword"
          v-i18n:placeholder
          type="search"
          placeholder="Find#!terminal.5"
          class="form-control"
        >
      </div>
      <div
        v-for="group in groups"
        :key="group.key"
        class="settings-group"
      >
        <h3 v-if="group.from" class="settings-group-title">{{ group.from }}</h3>
        <h3 v-else v-i18n class="settings-group-title">{{ group.name }}#!settings.group.{{ group.key }}</h3>
        <SettingsLine
          v-for="row in group.rows"
          :ref="item => lines[row.key] = (item as InstanceType<typeof SettingsLine> | null)?.$el"
          :key="row.key"
          v-model="settings[row.key]"
          v-model:open="open[row.key]"
          :spec="row"
          :current-value="settings[row.key]"
        >
          <template v-if="settingsComponents.has(row.key)" #default>
            <component :is="settingsComponents.get(row.key)" />
          </template>
        </SettingsLine>
      </div>
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.form-action {
  margin: 0;
}
.toggle-all.collapsed {
  opacity: 1;
}
.toggle-all-icon {
  transition: transform var(--design-out-back-timing-function) 0.2s;
  .toggle-all.collapsed & {
    transform: rotate(-90deg);
  }
}
.settings-group-title {
  margin: 8px 0;
  font-size: 16px;
  line-height: 24px;
}
.settings-searcher {
  width: 100%;
  .form-control {
    width: 50%;
  }
}
.settings-group :deep(.link) {
  color: rgb(var(--system-accent));
  opacity: 1;
}
</style>
