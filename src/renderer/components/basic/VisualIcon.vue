<script lang="ts" setup>
import 'devicon'
import featherSpriteURL from 'feather-icons/dist/feather-sprite.svg'
import lucideSpriteURL from 'lucide-static/sprite.svg'

const { name } = defineProps<{
  name: string,
}>()

const featherSpritePath = $computed(() => {
  return name.startsWith('feather-')
    ? `${featherSpriteURL}#${name.slice('feather-'.length)}`
    : undefined
})

const lucideSpritePath = $computed(() => {
  return name.startsWith('lucide-')
    ? `${lucideSpriteURL}#${name.slice('lucide-'.length)}`
    : undefined
})
</script>

<template>
  <svg v-if="featherSpritePath" class="visual-icon feather" aria-hidden="true">
    <use :href="featherSpritePath" />
  </svg>
  <svg v-else-if="lucideSpritePath" viewBox="0 0 24 24" class="visual-icon lucide" aria-hidden="true">
    <use :href="lucideSpritePath" />
  </svg>
  <span v-else :class="['visual-icon', name]"></span>
</template>

<style lang="scss" scoped>
.visual-icon.feather {
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
