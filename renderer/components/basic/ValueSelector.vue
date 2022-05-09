<script lang="ts" setup>
const { modelValue, pinned = [] } = defineProps<{
  modelValue: any,
  pinned?: string[],
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void,
}>()

let isPinned = $ref(modelValue && pinned.includes(modelValue))

function update(value, pinnedStatus: boolean) {
  isPinned = pinnedStatus
  emit('update:modelValue', value)
}
</script>

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
          <input :checked="!isPinned" type="radio" class="pinned-control" @change="update(undefined, false)">
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
