<template>
  <div class="internal-panel">
    <div class="pattern">$,,,</div>
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
.internal-panel .pattern {
  position: absolute;
  width: 128px;
  height: 128px;
  line-height: 128px;
  bottom: 24px;
  right: 24px;
  font-size: 56px;
  border-radius: 16px;
  text-align: center;
  font-family: 'Oxygen';
  font-weight: bold;
  color: var(--theme-background);
  background: var(--theme-foreground);
  opacity: 0.1;
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
  width: 12em;
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
.internal-panel input[type="checkbox"].form-control {
  margin: -3px 0 0;
  width: 14px;
  height: 14px;
}
.internal-panel .form-action {
  margin-left: 8px;
  font-size: 16px;
  width: 24px;
  text-align: center;
}
@keyframes blink {
  50% {
    opacity: 0.382;
  }
}
.internal-panel .form-action.loading {
  opacity: 1;
  animation: blink 1s ease-in-out infinite;
  pointer-events: none;
}
</style>
