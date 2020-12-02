<template>
  <div class="object-editor">
    <div v-for="entry in allEntries" :key="entry.id" class="property-line">
      <label v-if="entry.pinned" class="pinned-checker">
        <input :checked="entry.index !== -1" type="checkbox" @change="togglePinned(entry)">
      </label>
      <span v-else class="link remove" @click="remove(entry)">
        <span class="feather-icon icon-minus"></span>
      </span>
      <template v-if="withKeys">
        <input v-model="entry.key" :readonly="entry.pinned" type="text" class="form-control">
        <span class="property-arrow">
          <span class="feather-icon icon-arrow-right"></span>
        </span>
      </template>
      <input v-model="entry.value" :readonly="entry.pinned" type="text" class="form-control">
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
    pinned: {
      type: undefined,
      default: undefined,
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

    function transform(object) {
      if (!object) return []
      return Object.entries(object).map(([key, value]) => ({ key, value }))
    }

    function isMatchedWithPinned(entry, pinned) {
      if (props.withKeys && entry.key !== pinned.key) return false
      return entry.value === pinned.value
    }

    state.allEntries = computed(() => {
      const pinnedEntries = transform(props.pinned)
      const allPinnedEntries = pinnedEntries.map(entry => ({
        ...entry,
        pinned: true,
        index: state.entries.findIndex(item => isMatchedWithPinned(item, entry)),
        id: `pinned:${props.withKeys ? entry.key : entry.value}`,
      }))
      const extraEntries = state.entries
        .map((entry, index) => ({
          ...entry,
          index,
          id: index,
        }))
        .filter(entry => !pinnedEntries.some(item => isMatchedWithPinned(entry, item)))
      return [
        ...allPinnedEntries,
        ...extraEntries,
      ]
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
        state.entries = transform(props.modelValue)
      }
    }, { immediate: true })

    watch(resultRef, result => {
      emit('update:modelValue', result)
    })

    function add() {
      state.entries.push({ key: '', value: '' })
    }

    function remove(entry) {
      state.entries.splice(entry.index, 1)
    }

    function togglePinned(entry) {
      if (entry.index === -1) {
        state.entries.push({
          key: entry.key,
          value: entry.value,
        })
      } else {
        remove(entry)
      }
    }

    return {
      ...toRefs(state),
      add,
      remove,
      togglePinned,
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
.object-editor .pinned-checker {
  width: 24px;
  text-align: center;
  margin-right: 4px;
}
</style>
