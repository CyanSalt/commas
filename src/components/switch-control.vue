<template>
  <label class="switch-control">
    <input type="checkbox" @change="change"
      v-bind="$attrs" v-on="listeners">
    <span class="switch-content"></span>
  </label>
</template>

<script>
export default {
  name: 'SwitchControl',
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change',
  },
  computed: {
    listeners() {
      const {change, ...listeners} = this.$listeners
      return listeners
    },
  },
  methods: {
    change(event) {
      this.$emit('change', event.target.checked)
    },
  },
}
</script>

<style>
.switch-control {
  display: inline-flex;
}
.switch-control input {
  display: none;
}
.switch-control .switch-content {
  position: relative;
  display: inline-block;
  width: 2em;
  height: 1em;
}
.switch-control .switch-content::before {
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
}
.switch-control .switch-content::after {
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: 0.5em;
  background: currentColor;
  transition: transform 0.2s;
}
.switch-control input:checked + .switch-content::before {
  background: var(--design-blue);
  opacity: 1;
}
.switch-control input:checked + .switch-content::after {
  transform: translateX(100%);
}
</style>
