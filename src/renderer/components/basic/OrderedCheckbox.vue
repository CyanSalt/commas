<script lang="ts" setup>
const { index = -1 } = defineProps<{
  index?: number,
}>()

const emit = defineEmits<{
  (event: 'change'): void,
}>()

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
  position: relative;
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
      inset: 0;
      background: rgb(0 0 0 / 25%);
    }
    &:hover::before {
      background: rgb(0 0 0 / 25%);
    }
    &:active::before {
      background: rgb(255 255 255 / 25%);
    }
  }
}
.pseudo-control-text {
  position: relative;
  z-index: 1;
  color: white;
  font-size: 0.8em;
  user-select: none;
}
.control {
  display: none;
}
</style>
