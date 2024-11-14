<script lang="ts" setup>
import { onMounted } from 'vue'
import VisualIcon from './VisualIcon.vue'

const { disabled = false, unpinable = false, placeholder = '' } = defineProps<{
  disabled?: boolean,
  unpinable?: boolean,
  placeholder?: string,
}>()

let modelValue = $(defineModel<any>({ required: true }))
let pinned = $(defineModel<any[]>('pinned', { default: () => [] }))

defineSlots<{
  default?: (props: {}) => any,
}>()

let isPinned = $ref(false)

onMounted(() => {
  isPinned = Boolean(modelValue && pinned.includes(modelValue))
})

function update(value, pinnedStatus: boolean) {
  isPinned = pinnedStatus
  if (pinnedStatus) {
    modelValue = value
  }
}

function unpin(value) {
  pinned = pinned.filter(item => item !== value)
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
        <button v-if="unpinable" type="button" class="form-action remove" @click="unpin(value)">
          <VisualIcon name="lucide-x" />
        </button>
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
