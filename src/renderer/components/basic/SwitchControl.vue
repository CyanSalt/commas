<script lang="ts" setup>
let modelValue = $(defineModel<boolean>())

function change(event: Event) {
  modelValue = (event.target as HTMLInputElement).checked
}
</script>

<template>
  <label class="switch-control">
    <input
      type="checkbox"
      :checked="modelValue"
      class="switch-checkbox"
      @change="change"
    >
    <span class="switch-content"></span>
  </label>
</template>

<style lang="scss" scoped>
.switch-control {
  display: inline-flex;
}
.switch-checkbox {
  display: none;
}
.switch-content {
  position: relative;
  display: inline-block;
  width: 2em;
  height: 1em;
  padding: 1px;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    display: inline-block;
    background: currentColor;
    border-radius: 0.5em;
    opacity: 0.25;
    transition: opacity 0.2s, background 0.2s;
    .switch-checkbox:checked + & {
      background: rgb(var(--system-accent));
      opacity: 1;
    }
    .switch-checkbox:checked:disabled + & {
      filter: grayscale(1);
    }
  }
  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    display: inline-block;
    width: 1em;
    height: 1em;
    background: white;
    border-radius: 0.5em;
    transition: transform 0.2s;
    .switch-checkbox:checked + & {
      transform: translateX(100%);
    }
  }
}
</style>
