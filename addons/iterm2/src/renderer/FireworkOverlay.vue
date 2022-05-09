<script lang="ts" setup>
import { watchEffect } from 'vue'

const { position } = defineProps<{
  position: {
    x: number,
    y: number,
  },
}>()

const emit = defineEmits<{
  (event: 'animation-end'): void,
}>()

let count = 40
let animatingCount = $ref(count)

watchEffect(() => {
  if (animatingCount <= 0) {
    emit('animation-end')
  }
})
</script>

<template>
  <div class="firework-overlay" :style="{ top: `${position.y}px`, left: `${position.x}px` }">
    <div v-for="i in count" :key="i" class="line" :style="`--index: ${i}`">
      <div class="star" @animationend.once="animatingCount -= 1">★</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fly {
  from {
    transform: none;
  }
  to {
    transform: translate(-200vmax) rotate(10turn) scale(10);
  }
}
.firework-overlay {
  --time: 3s;
  --count: 40;
  position: fixed;
  z-index: 1;
  pointer-events: none;
}
.line {
  position: absolute;
  transform: rotate(calc(var(--index) * 360deg * 31.416 / var(--count)));
}
.star {
  position: absolute;
  color: hsl(calc(var(--index) * 360deg * 31.416 / var(--count)) 100% 50%);
  font-size: 32px;
  animation: fly forwards var(--time);
  animation-delay: calc(-0.2 * var(--index) * var(--time) / var(--count));
}
</style>
