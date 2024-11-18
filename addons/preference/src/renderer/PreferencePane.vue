<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, TerminalPane, VisualIcon } = commas.ui.vueAssets

const preferenceItems = commas.context.getCollection('preference.item')

function getItems(group: string) {
  const list = preferenceItems.filter(item => item.group === group)
  return list.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
}

const generalItems = $computed(() => getItems('general'))
const featureItems = $computed(() => getItems('feature'))
const customizationItems = $computed(() => getItems('customization'))
const aboutItems = $computed(() => getItems('about'))

const version = commas.app.getVersion()

function openUserDirectory(event: MouseEvent) {
  commas.remote.openUserDirectory(event)
}

function openDefaultSettings(event: MouseEvent) {
  commas.remote.openDefaultSettings(event)
}

function openSettingsFile(event: MouseEvent) {
  commas.remote.openSettingsFile(event)
}

const language = $(commas.remote.useLanguage())
const locales = commas.context.getCollection('preference.locale')
const supportedLanguages = $computed(() => {
  const languages = [...locales]
  if (language && !languages.some(item => item.value === language)) {
    languages.push({ label: language, value: language })
  }
  return languages
})

function openKeyBindings(event: MouseEvent) {
  commas.remote.openUserFile('keybindings.yaml', undefined, event)
}

function openTranslation(event: MouseEvent) {
  commas.remote.openUserFile('translation.yaml', undefined, event)
}

function openCustomJS(event: MouseEvent) {
  commas.remote.openUserFile('custom.js', undefined, event)
}

function openCustomCSS(event: MouseEvent) {
  commas.remote.openUserFile('custom.css', undefined, event)
}

function openWebsite(event: MouseEvent) {
  const manifest = commas.app.getManifest()
  commas.ui.openLink(manifest.homepage, event)
}
</script>

<template>
  <TerminalPane :tab="tab" class="preference-pane">
    <h2 v-i18n data-commas>General#!preference.2</h2>
    <form data-commas>
      <component
        :is="item.component"
        v-for="(item, index) in generalItems"
        :key="index"
      />
      <a href="" data-commas @click.prevent="openUserDirectory">
        <span v-i18n>Open user directory#!preference.6</span>
      </a>
      <a href="" data-commas @click.prevent="openDefaultSettings">
        <span v-i18n>Open default settings#!preference.7</span>
      </a>
      <a href="" data-commas @click.prevent="openSettingsFile">
        <span v-i18n="{ file: 'settings.yaml' }">Edit ${file}#!preference.8</span>
      </a>
    </form>
    <h2 v-i18n data-commas>Features#!preference.3</h2>
    <form data-commas>
      <component
        :is="item.component"
        v-for="(item, index) in featureItems"
        :key="index"
      />
    </form>
    <h2 v-i18n data-commas>Customization#!preference.4</h2>
    <form data-commas>
      <div data-commas>
        <label v-i18n data-commas>Language#!preference.10</label>
        <select v-model="language" data-commas>
          <option
            v-for="option in supportedLanguages"
            :key="option.value"
            :value="option.value"
          >{{ option.label }}</option>
        </select>
      </div>
      <component
        :is="item.component"
        v-for="(item, index) in customizationItems"
        :key="index"
      />
      <a href="" data-commas @click.prevent="openKeyBindings">
        <span v-i18n="{ file: 'keybindings.yaml' }">Edit ${file}#!preference.8</span>
      </a>
      <a href="" data-commas @click.prevent="openTranslation">
        <span v-i18n="{ file: 'translation.yaml' }">Edit ${file}#!preference.8</span>
      </a>
      <a href="" data-commas @click.prevent="openCustomJS">
        <span v-i18n="{ file: 'custom.js' }">Edit ${file}#!preference.8</span>
      </a>
      <a href="" data-commas @click.prevent="openCustomCSS">
        <span v-i18n="{ file: 'custom.css' }">Edit ${file}#!preference.8</span>
      </a>
    </form>
    <h2 v-i18n data-commas>About#!preference.5</h2>
    <form data-commas>
      <div data-commas>
        <label v-i18n data-commas>Current version#!preference.9</label>
        <span>{{ version }}</span>
        <button type="button" data-commas @click="openWebsite">
          <VisualIcon name="simple-icons-github" class="github-icon" />
        </button>
      </div>
      <component
        :is="item.component"
        v-for="(item, index) in aboutItems"
        :key="index"
      />
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.github-icon {
  transform: translateY(-1px);
}
</style>
