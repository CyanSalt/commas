<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { startCase } from 'lodash'
import type { ITheme } from 'xterm'

const { vI18n } = commas.ui.vueAssets

const { field } = defineProps<{
  field: string,
}>()

const name = $computed(() => startCase(field))

const settings = commas.remote.useSettings()
const theme = commas.remote.useTheme()

const model = $computed({
  get: () => {
    return settings['terminal.theme.customization'][field] ?? theme[field]
  },
  set: value => {
    const customization: ITheme = {
      ...settings['terminal.theme.customization'],
    }
    if (theme[field] === value) {
      delete customization[field]
    } else {
      customization[field] = value
    }
    settings['terminal.theme.customization'] = customization
  },
})
</script>

<template>
  <div class="theme-color-picker">
    <label v-i18n class="form-label">{{ name }}#!theme.field.{{ field }}</label>
    <input v-model.lazy="model" type="color" class="color-indicator">
  </div>
</template>

<style lang="scss" scoped>
.theme-color-picker {
  display: flex;
  align-items: center;
}
.color-indicator {
  border: none;
  background: var(--design-input-background);
  border-radius: 4px;
}
</style>
