<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'
import { useNonce } from './compositions'

const settings = $(commas.remote.useSettings())
const nonce = useNonce()

let lazyURL = $ref('')

const url = $computed(() => {
  const backgroundURL: string = settings['landscape.background.url']
  return backgroundURL ? backgroundURL.replace('<nonce>', String(nonce)) : ''
})

watchEffect(() => {
  const image = new Image()
  image.src = url
  image.addEventListener('load', () => {
    lazyURL = image.src
  })
})
</script>

<template>
  <transition name="landscape">
    <svg
      :key="lazyURL"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      class="landscape-slot"
    >
      <defs>
        <mask id="background-mask">
          <image
            width="100vw"
            height="100vh"
            preserveAspectRatio="none slice"
            :xlink:href="lazyURL"
          />
        </mask>
        <filter id="background-filter">
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect
        x="0"
        y="0"
        width="100vw"
        height="100vh"
        fill="rgb(var(--theme-foreground))"
        mask="url(#background-mask)"
        filter="url(#background-filter)"
      />
    </svg>
  </transition>
</template>

<style lang="scss" scoped>
.landscape-slot {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  &.landscape-enter-active {
    transition: opacity 0.5s;
  }
  &.landscape-enter-from,
  &.landscape-leave-to {
    opacity: 0;
  }
  &.landscape-enter-to,
  &.landscape-leave-from {
    opacity: 1;
  }
}
</style>
