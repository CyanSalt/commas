<script lang="ts" setup>
import VisualIcon from './VisualIcon.vue'

const { modelValue, pinned = (() => []) as never, disabled = false, unpinable = false, placeholder = '' } = defineProps<{
  modelValue: any,
  pinned?: any[],
  disabled?: boolean,
  unpinable?: boolean,
  placeholder?: string,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void,
  (event: 'update:pinned', value: any[]): void,
}>()

defineSlots<{
  default?: (props: {}) => any,
}>()

let isPinned = $ref(Boolean(modelValue && pinned.includes(modelValue)))

function update(value, pinnedStatus: boolean) {
  isPinned = pinnedStatus
  if (pinnedStatus) {
    emit('update:modelValue', value)
  }
}

function unpin(value) {
  emit('update:pinned', pinned.filter(item => item !== value))
}
</script>

<template>
  <div class="value-selector">
    <template v-for="value in pinned" :key="value">
      <div class="property-line">
        <label class="pinned-checker">
          <input
            type="radio"
            :checked="isPinned && value === modelValue"
            :disabled="disabled"
            class="pinned-control"
            @change="update(value, true)"
          >
        </label>
        <input :value="value" readonly type="text" :placeholder="placeholder" class="form-control">
        <span v-if="unpinable" class="form-action link remove" @click="unpin(value)">
          <VisualIcon name="lucide-x" />
        </span>
      </div>
    </template>
    <template v-if="pinned.length">
      <div class="property-line">
        <label class="pinned-checker">
          <input
            type="radio"
            :checked="!isPinned"
            :disabled="disabled"
            class="pinned-control"
            @change="update(undefined, false)"
          >
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
