<template>
  <label class="switch-control">
    <input
      v-bind="$attrs"
      type="checkbox"
      :checked="modelValue"
      class="switch-checkbox"
      @change="change"
    >
    <span class="switch-content"></span>
  </label>
</template>

<script lang="ts">
export default {
  name: 'switch-control',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': (value: boolean) => {
      return typeof value === 'boolean'
    },
  },
  setup(props, { emit }) {
    function change(event) {
      emit('update:modelValue', event.target.checked)
    }
    return {
      change,
    }
  },
}
</script>

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
  padding: 1px;
  width: 2em;
  height: 1em;
  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: '';
    display: inline-block;
    border-radius: 0.5em;
    background: currentColor;
    opacity: 0.25;
    transition: opacity 0.2s, background 0.2s;
    .switch-checkbox:checked + & {
      background: rgb(var(--system-accent));
      opacity: 1;
    }
  }
  &::after {
    position: absolute;
    top: 1px;
    left: 1px;
    content: '';
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 0.5em;
    background: white;
    transition: transform 0.2s;
    .switch-checkbox:checked + & {
      transform: translateX(100%);
    }
  }
}
</style>
