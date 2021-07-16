<template>
  <article class="terminal-pane">
    <div class="scroll-area">
      <slot></slot>
    </div>
    <ScrollBar keep-alive />
  </article>
</template>

<script lang="ts">
import ScrollBar from './scroll-bar.vue'

export default {
  components: {
    ScrollBar,
  },
}
</script>

<style lang="scss" scoped>
.terminal-pane {
  position: relative;
  padding: 4px 24px;
  height: 100%;
  box-sizing: border-box;
  z-index: 0;
}
.scroll-area {
  height: 100%;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 0px;
  }
  & > :last-child {
    margin-bottom: 16px;
  }
}
:deep(.group-title) {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  line-height: 24px;
}
:deep(.group) {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 32px;
}
:deep(.link) {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  &.disabled {
    pointer-events: none;
  }
  &:hover {
    opacity: 1;
  }
}
:deep(.text) {
  line-height: 32px;
}
:deep(.form-line),
:deep(.action-line) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
:deep(.form-line.block) {
  display: block;
  align-self: stretch;
  .form-label {
    display: block;
    width: auto;
  }
  input.form-control,
  textarea.form-control {
    box-sizing: border-box;
    width: 480px;
  }
  .object-editor input.form-control {
    width: 208px;
    &:only-of-type {
      width: 452px;
    }
  }
}
:deep(.form-line + .form-line) {
  margin-top: 10px;
}
:deep(.form-label) {
  width: 14em;
  align-self: flex-start;
}
:deep(.form-line-tip) {
  flex-basis: 100%;
  margin-bottom: 8px;
  font-size: 12px;
  font-style: italic;
  line-height: 24px;
  &::before {
    content: '*';
    margin-right: 1em;
  }
}
:deep(input.form-control),
:deep(textarea.form-control) {
  width: 165px;
  padding: 2px 6px;
  line-height: 20px;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  background: rgb(127 127 127 / 0.2);
  &::placeholder {
    color: rgb(var(--theme-foreground));
    opacity: 0.25;
  }
  &:read-only {
    opacity: 0.5;
  }
}
:deep(textarea.form-control) {
  height: 60px;
  resize: none;
}
:deep(input.immersive-control) {
  appearance: none;
  padding: 0;
  font: inherit;
  line-height: inherit;
  border: none;
  outline: none;
  color: inherit;
  background: transparent;
}
:deep(select.form-control) {
  padding: 2px 6px;
  font: inherit;
  line-height: 20px;
  height: 24px;
  border-radius: 4px;
  border: none;
  outline: none;
  background: rgb(127 127 127 / 0.2);
  color: var(--foreground-color);
}
:deep(.form-tips) {
  margin: 4px 0;
  line-height: 24px;
  font-size: 12px;
  user-select: text;
  opacity: 0.5;
}
:deep(.form-action) {
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  text-align: center;
}
</style>
