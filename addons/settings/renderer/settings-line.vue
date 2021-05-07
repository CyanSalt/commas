<template>
  <div :class="['user-setting-line', 'form-line', 'block', { collapsed }]">
    <label :class="['form-label', { customized: isCustomized, changed: isChanged }]">
      <span class="link tree-node" @click="toggle">
        <span class="feather-icon icon-chevron-down"></span>
      </span>
      <span v-i18n class="item-label">{{ spec.label }}#!settings.label.{{ spec.key }}</span>
      <span class="item-key">{{ spec.key }}</span>
    </label>
    <div class="setting-detail">
      <div class="form-tips">
        <div
          v-for="(comment, index) in spec.comments"
          :key="index"
          v-i18n
          class="form-tip-line"
        >{{ comment }}#!settings.comments.{{ index }}.{{ spec.key }}</div>
      </div>
      <switch-control v-if="spec.type === 'boolean'" v-model="model"></switch-control>
      <object-editor
        v-else-if="isSimpleObject"
        v-model="model"
        :with-keys="spec.type === 'map'"
        :pinned="spec.recommendations"
      >
        <template #note="{ item }">
          <template v-if="hasNotes">
            <div v-i18n class="form-tips">{{ getNote(item) }}</div>
          </template>
        </template>
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

<script lang="ts">
import { isEqual } from 'lodash-es'
import type { PropType } from 'vue'
import { reactive, computed, toRefs, unref } from 'vue'
import * as commas from '../../../api/renderer'
import type { EditorEntryItem } from '../../../renderer/components/basic/object-editor.vue'
import ObjectEditor from '../../../renderer/components/basic/object-editor.vue'
import SwitchControl from '../../../renderer/components/basic/switch-control.vue'
import type { SettingsSpec } from '../../../typings/settings'

export default {
  name: 'settings-line',
  components: {
    'switch-control': SwitchControl,
    'object-editor': ObjectEditor,
  },
  props: {
    spec: {
      type: Object as PropType<SettingsSpec>,
      required: true,
    },
    modelValue: {
      type: undefined,
      required: true,
    },
    currentValue: {
      type: undefined,
      required: true,
    },
  },
  emits: {
    'update:modelValue': (value: any) => {
      return true
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      collapsed: false,
    })

    const isSimpleObjectRef = computed(() => {
      return ['list', 'map'].includes(props.spec.type)
        && !['list', 'map'].includes(props.spec.paradigm?.[0])
    })

    const placeholderRef = computed(() => {
      return stringify(props.spec.default)
    })

    const modelRef = computed({
      get: () => {
        if (props.modelValue === undefined && ['boolean', 'enum', 'list', 'map'].includes(props.spec.type)) {
          return normalize(props.spec.default)
        }
        const isSimpleObject = unref(isSimpleObjectRef)
        if (isSimpleObject) {
          return normalize(props.modelValue)
        }
        return stringify(props.modelValue)
      },
      set: (value) => {
        emit('update:modelValue', parse(value))
      },
    })

    const isCustomizedRef = computed(() => {
      if (props.modelValue === undefined) return false
      return !isEqual(props.modelValue, props.spec.default)
    })

    const isChangedRef = computed(() => {
      return !isEqual(props.modelValue, props.currentValue)
    })

    const hasNotesRef = computed(() => {
      return props.spec.key === 'terminal.addon.includes'
    })

    function getNote(item: EditorEntryItem) {
      if (props.spec.key === 'terminal.addon.includes') {
        const { manifest } = commas.app.getAddonInfo(item.entry.value)
        return manifest ? manifest.description : ''
      }
      return undefined
    }

    function accepts(type: string) {
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
        return JSON.stringify(value, null, 2)
      }
      if (accepts('map') && typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      if (value === undefined) {
        return ''
      }
      return value as string | number | boolean
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
      modelRef.value = props.spec.default
    }

    return {
      ...toRefs(state),
      isSimpleObject: isSimpleObjectRef,
      placeholder: placeholderRef,
      model: modelRef,
      isCustomized: isCustomizedRef,
      isChanged: isChangedRef,
      hasNotes: hasNotesRef,
      getNote,
      toggle,
      reset,
    }
  },
}
</script>

<style lang="scss" scoped>
.user-setting-line {
  &.form-line.block .form-label {
    display: flex;
    align-items: center;
    &.customized {
      font-style: italic;
    }
    &.changed {
      color: rgb(var(--design-yellow));
    }
  }
}
.item-key {
  margin-left: 16px;
  font-size: 12px;
  opacity: 0.5;
}
.tree-node {
  width: 24px;
  text-align: center;
  opacity: 1;
  transition: transform 0.2s;
  .user-setting-line.collapsed & {
    transform: rotate(-90deg);
  }
}
.setting-detail {
  padding-left: 24px;
  .user-setting-line.collapsed & {
    display: none;
  }
}
</style>
