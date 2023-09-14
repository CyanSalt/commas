<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

const language = $(commas.remote.useLanguage())
const locales = commas.context.getCollection('l10n-ext.locale')
const supportedLanguages = $computed(() => {
  const languages = [...locales]
  if (language && !languages.some(item => item.value === language)) {
    languages.push({ label: language, value: language })
  }
  return languages
})
</script>

<template>
  <div class="locale-selector form-line">
    <label v-i18n class="form-label">Language#!l10n-ext.locale.1</label>
    <select v-model="language" class="form-control">
      <option
        v-for="option in supportedLanguages"
        :key="option.value"
        :value="option.value"
      >{{ option.label }}</option>
    </select>
  </div>
</template>
