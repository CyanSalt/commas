<template>
  <div class="value-selector">
    <template v-for="value in pinned" :key="value">
      <div class="property-line">
        <label class="pinned-checker">
          <input :checked="value === modelValue" type="radio" class="pinned-control" @change="update(value, true)">
        </label>
        <input :value="value" readonly type="text" class="form-control">
      </div>
    </template>
    <template v-if="pinned.length">
      <div class="property-line">
        <label class="pinned-checker">
          <input :checked="!isPinned" type="radio" class="pinned-control" @change="update(otherValue)">
        </label>
        <span v-if="isPinned" class="customization-placeholder">...</span>
        <slot v-else></slot>
      </div>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'

export default {
  props: {
    modelValue: {
      type: null,
      required: true,
    },
    pinned: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: {
    'update:modelValue': (value: any) => {
      return true
    },
  },
  setup(props, { emit }) {
    const isPinnedRef = ref(props.modelValue && props.pinned.includes(props.modelValue))

    function update(value, pinned: boolean) {
      isPinnedRef.value = pinned
      emit('update:modelValue', value)
    }

    return {
      isPinned: isPinnedRef,
      update,
    }
  },
}
</script>

<style lang="scss" scoped>
.property-line {
  display: flex;
  align-items: center;
}
.pinned-checker {
  width: 24px;
  margin-right: 4px;
  text-align: center;
}
.pinned-control {
  display: inline-block;
  margin: 0;
  vertical-align: middle;
}
.customization-placeholder {
  opacity: 0.5;
}
</style>
