<template>
  <article class="terminal-pane">
    <div class="scroll-area">
      <slot></slot>
    </div>
    <scroll-bar keep-alive></scroll-bar>
  </article>
</template>

<script lang="ts">
import ScrollBar from './scroll-bar.vue'

export default {
  name: 'terminal-pane',
  components: {
    'scroll-bar': ScrollBar,
  },
}
</script>

<style lang="scss">
.terminal-pane {
  position: relative;
  padding: 4px 24px;
  height: 100%;
  box-sizing: border-box;
  z-index: 0;
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
  .group-title {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 18px;
    line-height: 24px;
  }
  .group {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 32px;
  }
  .link {
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
  .text {
    line-height: 32px;
  }
  .form-line,
  .action-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .form-line.block {
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
  .form-line + .form-line {
    margin-top: 10px;
  }
  .form-label {
    width: 14em;
    align-self: flex-start;
  }
  .form-line-tip {
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
  input.form-control,
  textarea.form-control {
    width: 165px;
    padding: 2px 6px;
    line-height: 20px;
    border: none;
    outline: none;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    background: rgba(127, 127, 127, 0.2);
    &::placeholder {
      color: var(--theme-foreground);
      opacity: 0.25;
    }
    &:read-only {
      opacity: 0.5;
    }
  }
  textarea.form-control {
    height: 60px;
    resize: none;
  }
  input.immersive-control {
    appearance: none;
    padding: 0;
    font: inherit;
    line-height: inherit;
    border: none;
    outline: none;
    color: inherit;
    background: transparent;
  }
  select.form-control {
    padding: 2px 6px;
    line-height: 20px;
    height: 24px;
    border-radius: 4px;
    border: none;
    outline: none;
    background: rgba(127, 127, 127, 0.2);
    color: var(--foreground-color);
  }
  .form-tips {
    margin: 4px 0;
    line-height: 24px;
    font-size: 12px;
    user-select: text;
    opacity: 0.5;
  }
  .form-action {
    margin-left: 8px;
    font-size: 16px;
    width: 24px;
    text-align: center;
  }
}
</style>
