<template>
  <div class="object-editor">
    <div v-for="(entry, index) in entries" :key="index" class="property-line">
      <span class="link remove" @click="remove(index)">
        <span class="feather-icon icon-minus"></span>
      </span>
      <template v-if="withKeys">
        <input v-model="entry.key" type="text" class="form-control">
        <span class="property-arrow">
          <span class="feather-icon icon-arrow-right"></span>
        </span>
      </template>
      <input v-model="entry.value" type="text" class="form-control">
    </div>
    <div class="property-line extra-line">
      <span class="link add" @click="add">
        <span class="feather-icon icon-plus"></span>
      </span>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script>
import { isEqual } from 'lodash-es'
import { computed, reactive, toRefs, unref, watch } from 'vue'

export default {
  name: 'object-editor',
  props: {
    modelValue: {
      type: undefined,
      required: true,
    },
    withKeys: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': (value) => {
      return !value || typeof value === 'object'
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      entries: [],
    })

    const resultRef = computed(() => {
      if (props.withKeys) {
        return Object.fromEntries(state.entries.map(({ key, value }) => [key, value]))
      } else {
        return state.entries.map(({ key, value }) => value)
      }
    })

    watch(() => props.modelValue, modelValue => {
      const result = unref(resultRef)
      if (!isEqual(modelValue, result)) {
        state.entries = props.modelValue
          ? Object.entries(props.modelValue).map(([key, value]) => ({ key, value }))
          : []
      }
    }, { immediate: true })

    watch(resultRef, result => {
      emit('update:modelValue', result)
    })

    function add() {
      state.entries.push({ key: '', value: '' })
    }

    function remove(index) {
      state.entries.splice(index, 1)
    }

    return {
      ...toRefs(state),
      add,
      remove,
    }
  },
}
</script>

<style>
.object-editor .property-line {
  display: flex;
  align-items: center;
}
.object-editor .property-line .link {
  width: 24px;
  text-align: center;
}
.object-editor .property-line .link:first-child {
  margin-right: 4px;
}
.object-editor .property-line .link.remove:hover {
  color: var(--design-red);
}
.object-editor .property-arrow {
  width: 36px;
  text-align: center;
}
</style>
