<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { groupBy, startCase } from 'lodash'
import { nextTick, onBeforeUpdate, watchEffect } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import SettingsLine from './SettingsLine.vue'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, TerminalPane } = commas.ui.vueAssets

const keyword: string = $ref('')

const settings = commas.remote.useSettings()
let paneTabURL: string = $(commas.workspace.usePaneTabURL())
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
  return Object.entries(groupBy(configurableSpecs, spec => {
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
        const manifest = commas.remote.getAddonManifest(addon.manifest)
        from = manifest.productName ?? manifest.name ?? addon.name
      }
    }
    return {
      key,
      name,
      from,
      rows: rows.filter(row => commas.helper.matches([row.key, commas.remote.translate(row.label)], keyword)),
    }
  }).filter(group => group.rows.length)
})

watchEffect(async () => {
  if (!specs.length) return
  if (paneTabURL) {
    const url = new URL(paneTabURL)
    const target = url.hash.slice(1)
    if (target) {
      await nextTick()
      lines[target]?.scrollIntoView(true)
    }
  }
})

watchEffect(() => {
  open = configurableSpecs.reduce((record, spec) => {
    record[spec.key] = true
    return record
  }, {})
})

let isCollapsed = $computed<boolean>({
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
  <TerminalPane class="settings-pane">
    <h2 v-i18n class="group-title">Settings#!settings.1</h2>
    <form class="group">
      <div class="action-line settings-searcher">
        <span :class="['link form-action toggle-all', { collapsed: isCollapsed }]" @click="toggleAll">
          <span class="feather-icon icon-chevrons-down"></span>
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
        />
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
  transform: rotate(-90deg);
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
</style>
