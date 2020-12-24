<template>
  <svg
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
          :xlink:href="url"
        />
      </mask>
      <filter id="background-filter">
        <feComponentTransfer>
          <feFuncA type="linear" slope="5" intercept="-4.7" />
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
</template>

<script>
import { computed, reactive, toRefs, unref } from 'vue'
import { useSettings } from '../../hooks/settings.mjs'

export default {
  name: 'landscape-slot',
  setup() {
    const state = reactive({
      nonce: Date.now(),
    })

    const settingsRef = useSettings()

    state.url = computed(() => {
      const settings = unref(settingsRef)
      return settings['landscape.background.url'].replace('<nonce>', state.nonce)
    })

    return {
      ...toRefs(state),
    }
  },
}
</script>

<style>
.landscape-slot {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>
