<template>
  <div class="internal-panel">
    <svg class="app-pattern" viewBox="0 0 144 144" version="1.1"
      xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect x="10.8" y="10.8" width="122.4" height="122.4" rx="38.4" ry="38.4"/>
      <path d="M57 72h24" stroke="currentColor" stroke-width="6" stroke-opacity=".8" stroke-linecap="round" fill="none"/>
      <path d="M42.52 35.7a11.12 11.12 0 100 22.23 10.37 10.37 0 002.5-.32.56.56 0 01.63.83 15.37 15.37 0 01-13.23 7.93 2.81 2.81 0 000 5.62 21.85 21.85 0 0021.22-22.38v-2.8A11.13 11.13 0 0042.52 35.7z" fill="currentColor" fill-opacity=".8"/>
    </svg>
    <div class="scroll-area">
      <slot></slot>
    </div>
    <scroll-bar></scroll-bar>
  </div>
</template>

<script>
import ScrollBar from './scroll-bar'

export default {
  name: 'InternalPanel',
  components: {
    'scroll-bar': ScrollBar,
  },
}
</script>

<style>
.internal-panel {
  position: relative;
  padding: 4px 24px;
  height: 100%;
  box-sizing: border-box;
}
.internal-panel .app-pattern {
  position: absolute;
  width: 144px;
  height: 144px;
  bottom: 12px;
  right: 12px;
  color: var(--theme-background);
  opacity: 0.1;
}
.internal-panel .app-pattern rect {
  fill: var(--theme-foreground);
}
.internal-panel .scroll-area {
  height: 100%;
  overflow: auto;
}
.internal-panel .scroll-area::-webkit-scrollbar {
  width: 0px;
}
.internal-panel .scroll-area > :last-child {
  margin-bottom: 16px;
}
.internal-panel .group-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  line-height: 24px;
}
.internal-panel .group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 32px;
}
.internal-panel .link {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.internal-panel .link.disabled {
  pointer-events: none;
}
.internal-panel .link:hover {
  opacity: 1;
}
.internal-panel .text {
  line-height: 32px;
}
.internal-panel .form-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.internal-panel .form-label {
  width: 14em;
}
.internal-panel .form-line-tip {
  flex-basis: 100%;
  margin-bottom: 8px;
  font-size: 12px;
  font-style: italic;
  line-height: 24px;
}
.internal-panel .form-line-tip::before {
  content: '*';
  margin-right: 1em;
}
.internal-panel input[type="text"].form-control {
  padding: 2px 6px;
  line-height: 20px;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  background: rgba(127, 127, 127, 0.2);
}
.internal-panel input[type="text"].form-control::placeholder {
  color: var(--theme-foreground);
  opacity: 0.25;
}
.internal-panel input[type="text"].form-control:read-only {
  opacity: 0.5;
}
.internal-panel .form-action {
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  text-align: center;
}
</style>
