<template>
  <div class="locale-selector form-line">
    <label v-i18n class="form-label">Language#!menu.locale.1</label>
    <select v-model="language" class="form-control">
      <option
        v-for="option in supportedLanguages"
        :key="option"
        v-i18n
        :value="option.value"
      >{{ option.label }}#!menu.locale.{{ option.value }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { computed, unref } from 'vue'
import * as commas from '../../../api/renderer'
import { useLanguage } from '../../../renderer/hooks/i18n'

interface LanguageOption {
  label: string,
  value: string,
}

export default {
  setup() {
    const languageRef = useLanguage()
    const locales: LanguageOption[] = commas.context.getCollection('locales')
    const supportedLanguages = computed(() => {
      const languages = [...locales]
      const language = unref(languageRef)
      if (language && !languages.some(item => item.value === language)) {
        languages.push({ label: language, value: language })
      }
      return languages
    })

    return {
      language: languageRef,
      supportedLanguages,
    }
  },
}
</script>
