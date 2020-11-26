<template>
  <div :class="['user-setting-line', 'form-line', 'block', { collapsed }]">
    <label class="form-label">
      <span class="link tree-node" @click="toggle">
        <span class="feather-icon icon-chevron-down"></span>
      </span>
      <span v-i18n class="item-label">{{ spec.label }}#!user-settings.label.{{ spec.key }}</span>
      <span class="item-key">{{ spec.key }}</span>
    </label>
    <div class="setting-detail">
      <div class="form-tips">
        <div
          v-for="(comment, index) in spec.comments"
          :key="index"
          v-i18n
          class="form-tip-line"
        >{{ comment }}#!user-settings.comments.{{ index }}.{{ spec.key }}</div>
      </div>
      <switch-control v-if="spec.type === 'boolean'" v-model="model"></switch-control>
      <object-editor
        v-else-if="spec.type === 'list' || spec.type === 'map'"
        v-model="model"
        :with-keys="spec.type === 'map'"
        :pinned="spec.recommendations"
      >
        <template #extra>
          <span class="link reset" @click="reset">
            <span class="feather-icon icon-rotate-ccw"></span>
          </span>
        </template>
      </object-editor>
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
  </div>
</template>

<script>
import { reactive, computed, toRefs } from 'vue'
import ObjectEditor from '../../components/basic/object-editor.vue'
import SwitchControl from '../../components/basic/switch-control.vue'

export default {
  name: 'user-settings-line',
  components: {
    'switch-control': SwitchControl,
    'object-editor': ObjectEditor,
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
    const state = reactive({
      collapsed: false,
    })

    state.placeholder = computed(() => {
      return stringify(props.spec.default)
    })

    state.model = computed({
      get: () => {
        if (props.modelValue === undefined && ['boolean', 'enum', 'list', 'map'].includes(props.spec.type)) {
          return normalize(props.spec.default)
        }
        if (['list', 'map'].includes(props.spec.type)) {
          return normalize(props.modelValue)
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

    function normalize(value) {
      if (accepts('list') && Array.isArray(value)) {
        return value
      }
      if (accepts('map') && typeof value === 'object') {
        return value
      }
      if (value === undefined) {
        return ''
      }
      return value
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

    function toggle() {
      state.collapsed = !state.collapsed
    }

    function reset() {
      state.model = props.spec.default
    }

    return {
      ...toRefs(state),
      toggle,
      reset,
    }
  },
}
</script>

<style>
.user-setting-line.form-line.block .form-label {
  display: flex;
  align-items: center;
}
.user-setting-line .item-key {
  margin-left: 16px;
  font-size: 12px;
  opacity: 0.5;
}
.user-setting-line .tree-node {
  width: 24px;
  text-align: center;
  opacity: 1;
  transition: transform 0.2s;
}
.user-setting-line.collapsed .tree-node {
  transform: rotate(-90deg);
}
.user-setting-line .setting-detail {
  padding-left: 24px;
}
.user-setting-line.collapsed .setting-detail {
  display: none;
}
</style>
