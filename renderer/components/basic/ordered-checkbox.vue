<script lang="ts" setup>
const { index } = defineProps({
  index: {
    type: Number,
    default: -1,
  },
})

const emit = defineEmits({
  change: () => {
    return true
  },
})

const order = $computed(() => {
  return index + 1
})

const checked = $computed<boolean>({
  get() {
    return Boolean(order)
  },
  set() {
    emit('change')
  },
})
</script>

<template>
  <span :class="['ordered-checkbox', { 'is-checked': checked }]">
    <span class="pseudo-control">
      <span v-if="checked" class="pseudo-control-text">{{ order }}</span>
    </span>
    <input v-model="checked" type="checkbox" class="control">
  </span>
</template>

<style lang="scss" scoped>
.ordered-checkbox {
  display: inline-flex;
}
.pseudo-control {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 1em;
  height: 1em;
  border: 1px solid rgb(118 118 118);
  background: white;
  border-radius: 3px;
  &:hover {
    border-color: rgb(59 59 59);
  }
  .ordered-checkbox.is-checked & {
    border-width: 0px;
    background: rgb(var(--system-accent));
    &:hover::before, &:active::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgb(0 0 0 / 0.25);
    }
    &:hover::before {
      background: rgb(0 0 0 / 0.25);
    }
    &:active::before {
      background: rgb(255 255 255 / 0.25);
    }
  }
}
.pseudo-control-text {
  color: white;
  font-size: 0.8em;
  user-select: none;
}
.control {
  display: none;
}
</style>
