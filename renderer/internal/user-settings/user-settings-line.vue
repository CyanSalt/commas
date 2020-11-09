<template>
  <div class="form-line">
    <label v-i18n class="form-label">{{ spec.label }}#!user-settings.{{ spec.key }}</label>
    <switch-control v-if="spec.type === 'boolean'" v-model="model"></switch-control>
    <input
      v-else-if="spec.type === 'number'"
      v-model="model"
      :placeholder="placeholder"
      type="number"
      class="form-control"
    >
    <input
      v-else-if="spec.type === 'string'"
      v-model="model"
      :placeholder="placeholder"
      type="text"
      class="form-control"
    >
    <select
      v-else-if="spec.type === 'enum'"
      v-model="model"
      class="form-control"
    >
      <option
        v-for="option in spec.paradigm"
        :key="option"
      >{{ option }}</option>
    </select>
    <textarea
      v-else
      v-model="model"
      :placeholder="placeholder"
      class="form-control"
    ></textarea>
  </div>
</template>

<script>
import { reactive, computed, toRefs } from 'vue'
import SwitchControl from '../../components/basic/switch-control.vue'

export default {
  name: 'user-settings-line',
  components: {
    'switch-control': SwitchControl,
  },
  props: {
    spec: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: undefined,
      required: true,
    },
  },
  emits: {
    'update:modelValue': (value) => {
      return true
    },
  },
  setup(props, { emit }) {
    const state = reactive({})

    state.placeholder = computed(() => {
      return stringify(props.spec.default)
    })

    state.model = computed({
      get: () => {
        if (props.modelValue === undefined && ['boolean', 'enum'].includes(props.spec.type)) {
          return state.placeholder
        }
        return stringify(props.modelValue)
      },
      set: (value) => {
        emit('update:modelValue', parse(value))
      },
    })

    function accepts(type) {
      return props.spec.type === type || (
        Array.isArray(props.spec.type) && props.spec.type.includes(type)
      )
    }

    function stringify(value) {
      if (accepts('list') && Array.isArray(value)) {
        return JSON.stringify(value)
      }
      if (accepts('map') && typeof value === 'object') {
        return JSON.stringify(value)
      }
      if (value === undefined) {
        return ''
      }
      return value
    }

    function parseJSON(value) {
      try {
        return JSON.parse(value)
      } catch {
        return undefined
      }
    }

    function parse(value) {
      if (accepts('map')) {
        const parsed = parseJSON(value)
        if (typeof parsed === 'object') {
          return parsed
        }
      }
      if (accepts('list')) {
        const parsed = parseJSON(value)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
      if (accepts('number')) {
        const parsed = parseJSON(value)
        if (typeof parsed === 'number') {
          return parsed
        }
      }
      if (!accepts('string') && value === '') {
        return undefined
      }
      return value
    }

    return {
      ...toRefs(state),
    }
  },
}
</script>
