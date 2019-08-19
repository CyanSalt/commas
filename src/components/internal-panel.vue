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
.internal-panel .link .feather-icon {
  margin-left: 4px;
}
.internal-panel .text {
  line-height: 32px;
}
</style>
