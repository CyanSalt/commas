<script lang="ts" setup>
import { watch } from 'vue'

interface DialItem {
  color: string,
  percentage: number,
}

const { items, duration, position = 0 } = defineProps<{
  items: DialItem[],
  duration: number,
  position?: number,
}>()

const emit = defineEmits({
  'rotate-finish': (value: DialItem | undefined) => true,
})

const pointer = $ref<HTMLDivElement>()

const shapes = $computed(() => {
  const result: { item: DialItem, start: number, end: number }[] = []
  let current = 0
  for (const item of items) {
    result.push({ item, start: current, end: current + item.percentage })
    current += item.percentage
    if (item.percentage > 0.5) {
      result.push({ item, start: current - 0.5, end: current })
    }
  }
  return result
})

const totalPercentage = $computed(() => {
  return items.reduce((n, item) => n + item.percentage, 0)
})

watch($$(position), (value, oldValue) => {
  const animation = pointer.animate([
    { transform: `rotate(${oldValue}turn)` },
    { transform: `rotate(${5 + value}turn)` },
  ], { duration, easing: 'ease-out', fill: 'forwards' })
  animation.addEventListener('finish', () => {
    const target = shapes.find(shape => value > shape.start && value <= shape.end)
    emit('rotate-finish', target?.item)
  })
})
</script>

<template>
  <div class="fun-dial">
    <div class="semicircle end-semi"></div>
    <div
      v-for="(shape, index) in shapes"
      :key="index"
      :class="['semi-mask', { 'is-active': shape.start > 0.5 }]"
    >
      <div
        class="semicircle item-semi"
        :style="{
          color: `rgb(var(--design-${shape.item.color}))`,
          transform: `rotate(${shape.start}turn)`,
        }"
      ></div>
    </div>
    <div :class="['semi-mask', { 'is-active': totalPercentage > 0.5 }]">
      <div
        class="semicircle start-semi"
        :style="{
          transform: `rotate(${totalPercentage}turn)`,
        }"
      ></div>
    </div>
    <slot></slot>
    <div ref="pointer" class="pointer"></div>
  </div>
</template>

<style lang="scss" scoped>
.fun-dial {
  position: relative;
  width: var(--dial-size);
  height: var(--dial-size);
  border-radius: 50%;
}
.semicircle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(to right, transparent 50%, currentColor 50%);
  border-radius: 50%;
}
.start-semi,
.end-semi {
  background: linear-gradient(to right, transparent 50%, rgb(var(--theme-foreground) / 0.5) 50%),
    linear-gradient(to right, transparent 50%, rgb(var(--theme-background)) 50%);
}
.end-semi {
  transform: rotate(0.5turn);
}
.semi-mask {
  position: absolute;
  top: 0;
  right: 50%;
  bottom: 0;
  left: 0;
  &.is-active {
    overflow: hidden;
  }
  .semicircle {
    right: -100%;
  }
}
.pointer {
  position: absolute;
  top: 5%;
  bottom: 50%;
  left: 50%;
  width: 4px;
  margin-left: -2px;
  background: rgb(var(--design-red));
  border-radius: 2px;
  transform-origin: bottom;
}
</style>
