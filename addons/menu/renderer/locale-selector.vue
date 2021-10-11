<template>
  <div class="locale-selector form-line">
    <label v-i18n class="form-label">Language#!menu.locale.1</label>
    <select v-model="userLanguage" class="form-control">
      <option v-i18n value="">Follow System#!menu.locale.2</option>
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
import * as commas from '../../../api/renderer'
import { useUserLanguage } from '../../../renderer/hooks/i18n'

interface LanguageOption {
  label: string,
  value: string,
}

export default {
  setup() {
    const userLanguage = useUserLanguage()
    const supportedLanguages: LanguageOption[] = commas.context.getCollection('locales')

    return {
      userLanguage,
      supportedLanguages,
    }
  },
}
</script>
