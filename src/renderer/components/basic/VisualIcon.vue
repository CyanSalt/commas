<script lang="ts" setup>
import '@phosphor-icons/web/bold'
import 'devicon'

const { name } = defineProps<{
  name: string,
}>()

const isPhosphorIcon = $computed(() => name.startsWith('ph-'))
</script>

<template>
  <span v-if="isPhosphorIcon" :class="['visual-icon', 'ph-bold', name]"></span>
  <span v-else :class="['visual-icon', name]"></span>
</template>

<style lang="scss" scoped>
.visual-icon.ph-bold {
  line-height: inherit;
}
</style>
