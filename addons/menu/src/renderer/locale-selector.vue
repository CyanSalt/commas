<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

interface LanguageOption {
  label: string,
  value: string,
}

const language = $(commas.workspace.useLanguage())
const locales: LanguageOption[] = commas.context.getCollection('locales')
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
    <label v-i18n class="form-label">Language#!menu.locale.1</label>
    <select v-model="language" class="form-control">
      <option
        v-for="option in supportedLanguages"
        :key="option.value"
        v-i18n
        :value="option.value"
      >{{ option.label }}#!menu.locale.{{ option.value }}</option>
    </select>
  </div>
</template>
