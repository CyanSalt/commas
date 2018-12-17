<template>
  <div :class="['scroll-bar', {scrolling}]" v-show="overflow">
    <div class="scroll-track" @click.self="jump"></div>
    <div class="scroll-thumb" :style="style" @mousedown="scroll"></div>
  </div>
</template>

<script>
export default {
  name: 'scroll-bar',
  props: {
    parent: {
      type: HTMLElement,
    },
  },
  data() {
    return {
      animation: null,
      maxHeight: 0,
      height: 0,
      top: 0,
      scrolling: false,
    }
  },
  computed: {
    container() {
      return this.parent || this.$el.previousElementSibling
    },
    overflow() {
      return this.height && this.height !== this.maxHeight
    },
    style() {
      return {
        height: this.height + 'px',
        top: this.top + 'px',
      }
    },
  },
  methods: {
    animate(action) {
      if (this.animation) return
      this.animation = () => {
        requestAnimationFrame(action)
        this.animation = null
      }
      this.animation()
    },
    follow() {
      const ratio = this.maxHeight / this.container.scrollHeight
      this.height = Math.round(this.container.clientHeight * ratio)
      this.top = Math.round(this.container.scrollTop * ratio)
    },
    send(position) {
      position = Math.min(Math.max(position, 0), this.container.scrollHeight)
      const ratio = this.maxHeight / this.container.scrollHeight
      this.container.scrollTop = Math.round(position / ratio)
    },
    scroll(e) {
      this.scrolling = true
      const start = {
        top: this.top,
        offset: e.clientY,
      }
      const handler = event => {
        this.animate(() => this.send(start.top + event.clientY - start.offset))
      }
      const cancelation = () => {
        this.scrolling = false
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', cancelation)
      }
      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', cancelation)
    },
    jump(event) {
      this.animate(() => this.send(event.offsetY - (this.height / 2)))
    },
  },
  mounted() {
    this.maxHeight = this.$el.parentElement.clientHeight
    this.container.addEventListener('scroll', () => {
      this.animate(() => this.follow())
    }, {passive: true})
  }
}
</script>

<style>
.scroll-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 12px;
  z-index: 4;
}
.scroll-bar .scroll-track,
.scroll-bar .scroll-thumb {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  top: 0;
  background: var(--theme-foreground);
  opacity: 0;
  transition: opacity 0.5s;
}
.scroll-bar:hover .scroll-track,
.scroll-bar.scrolling .scroll-track {
  opacity: 0.1;
}
.scroll-bar:hover .scroll-thumb,
.scroll-bar.scrolling .scroll-thumb {
  opacity: 0.2;
}
</style>
