<script lang="ts" setup>
import 'simple-icons-font/font/simple-icons.css'
import lucideSpriteURL from 'lucide-static/sprite.svg'
import { LucideIcon, SimpleIconsIcon } from './icon'

const { name } = defineProps<{
  name: LucideIcon | SimpleIconsIcon | (string & {}),
}>()

const lucideSpritePath = $computed(() => {
  return name.startsWith('lucide-')
    ? `${lucideSpriteURL}#${name.slice('lucide-'.length)}`
    : undefined
})

const simpleIconsClass = $computed(() => {
  return name.startsWith('simple-icons-')
    ? `si si-${name.slice('simple-icons-'.length)}`
    : undefined
})
</script>

<template>
  <svg v-if="lucideSpritePath" viewBox="0 0 24 24" class="visual-icon lucide" aria-hidden="true">
    <use :href="lucideSpritePath" />
  </svg>
  <span v-else-if="simpleIconsClass" :class="['visual-icon', simpleIconsClass]"></span>
  <span v-else :class="['visual-icon', name]"></span>
</template>

<style lang="scss" scoped>
.visual-icon.lucide {
  width: 1em;
  height: 1em;
  vertical-align: -0.375ex;
  fill: none;
  stroke: currentColor;
  translate: 0 -0.125ex;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
