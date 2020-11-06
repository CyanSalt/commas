<template>
  <div class="terminal-pane">
    <svg
      class="app-pattern"
      viewBox="0 0 144 144"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="10.8"
        y="10.8"
        width="122.4"
        height="122.4"
        rx="38.4"
        ry="38.4"
      />
      <path
        d="M63 79h24"
        stroke="currentColor"
        stroke-width="6"
        stroke-opacity=".8"
        stroke-linecap="round"
        fill="none"
      />
      <path d="M48.52 41.7a11.12 11.12 0 100 22.23 10.37 10.37 0 002.5-.32.56.56 0 01.63.83 15.37 15.37 0 01-13.23 7.93 2.81 2.81 0 000 5.62 21.85 21.85 0 0021.22-22.38v-2.8A11.13 11.13 0 0048.52 41.7z" fill="currentColor" fill-opacity=".8" />
    </svg>
    <div class="scroll-area">
      <slot></slot>
    </div>
    <scroll-bar keep-alive></scroll-bar>
  </div>
</template>

<script>
import ScrollBar from './scroll-bar.vue'

export default {
  name: 'TerminalPane',
  components: {
    'scroll-bar': ScrollBar,
  },
}
</script>

<style>
.terminal-pane {
  position: relative;
  padding: 4px 24px;
  height: 100%;
  box-sizing: border-box;
  z-index: 0;
}
.terminal-pane .app-pattern {
  position: absolute;
  width: 144px;
  height: 144px;
  bottom: 12px;
  right: 12px;
  color: var(--theme-background);
  opacity: 0.1;
  pointer-events: none;
  z-index: -1;
}
.terminal-pane .app-pattern rect {
  fill: var(--theme-foreground);
}
.terminal-pane .scroll-area {
  height: 100%;
  overflow: auto;
}
.terminal-pane .scroll-area::-webkit-scrollbar {
  width: 0px;
}
.terminal-pane .scroll-area > :last-child {
  margin-bottom: 16px;
}
.terminal-pane .group-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  line-height: 24px;
}
.terminal-pane .group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 32px;
}
.terminal-pane .link {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
}
.terminal-pane .link.disabled {
  pointer-events: none;
}
.terminal-pane .link:hover {
  opacity: 1;
}
.terminal-pane .text {
  line-height: 32px;
}
.terminal-pane .form-line,
.terminal-pane .action-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.terminal-pane .form-line + .form-line {
  margin-top: 10px;
}
.terminal-pane .form-label {
  width: 14em;
  align-self: flex-start;
}
.terminal-pane .form-line-tip {
  flex-basis: 100%;
  margin-bottom: 8px;
  font-size: 12px;
  font-style: italic;
  line-height: 24px;
}
.terminal-pane .form-line-tip::before {
  content: '*';
  margin-right: 1em;
}
.terminal-pane input.form-control,
.terminal-pane input.form-control,
.terminal-pane textarea.form-control {
  padding: 2px 6px;
  line-height: 20px;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  background: rgba(127, 127, 127, 0.2);
}
.terminal-pane textarea.form-control {
  width: 165px;
  height: 60px;
  resize: none;
}
.terminal-pane input.form-control::placeholder,
.terminal-pane textarea.form-control::placeholder {
  color: var(--theme-foreground);
  opacity: 0.25;
}
.terminal-pane input.form-control:read-only,
.terminal-pane textarea.form-control:read-only {
  opacity: 0.5;
}
.terminal-pane input.immersive-control {
  appearance: none;
  padding: 0;
  font: inherit;
  line-height: inherit;
  border: none;
  outline: none;
  color: inherit;
  background: transparent;
}
.terminal-pane .form-action {
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  text-align: center;
}
</style>
