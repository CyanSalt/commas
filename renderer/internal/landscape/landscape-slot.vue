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
        fill="var(--theme-foreground)"
        mask="url(#background-mask)"
        filter="url(#background-filter)"
      />
    </svg>
  </transition>
</template>

<script lang="ts">
import { computed, reactive, toRefs, unref, watchEffect } from 'vue'
import { useSettings } from '../../hooks/settings'
import { useNonce } from './hooks'

export default {
  name: 'landscape-slot',
  setup() {
    const state = reactive({
      nonce: useNonce(),
      lazyURL: '',
    })

    const settingsRef = useSettings()
    const urlRef = computed(() => {
      const settings = unref(settingsRef)
      const url: string = settings['landscape.background.url']
      return url ? url.replace('<nonce>', String(state.nonce)) : ''
    })

    watchEffect(() => {
      const image = new Image()
      image.src = unref(urlRef)
      image.addEventListener('load', () => {
        state.lazyURL = image.src
      })
    })

    return {
      ...toRefs(state),
    }
  },
}
</script>

<style lang="scss">
.landscape-slot {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
