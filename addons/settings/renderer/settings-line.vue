<template>
  <div :class="['user-setting-line', 'form-line', 'block', { collapsed: isCollapsed }]">
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
      <SwitchControl v-if="spec.type === 'boolean'" v-model="model" />
      <ObjectEditor
        v-else-if="isSimpleObject"
        v-model="model"
        :with-keys="spec.type === 'map'"
        :pinned="recommendations"
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
      </ObjectEditor>
      <select
        v-else-if="spec.type === 'enum'"
        v-model="model"
        class="form-control"
      >
        <option
          v-for="option in spec.paradigm"
          :key="option"
          :value="option"
        >{{ option }}</option>
      </select>
      <ValueSelector v-else v-model="model" :pinned="recommendations">
        <input
          v-if="spec.type === 'number'"
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
        <textarea
          v-else
          v-model="model"
          :placeholder="placeholder"
          class="form-control"
        ></textarea>
      </ValueSelector>
    </div>
  </div>
</template>

<script lang="ts">
import { isEqual } from 'lodash-es'
import { computed, ref, unref } from 'vue'
import type { PropType } from 'vue'
import ObjectEditor from '../../../renderer/components/basic/object-editor.vue'
import type { EditorEntryItem } from '../../../renderer/components/basic/object-editor.vue'
import SwitchControl from '../../../renderer/components/basic/switch-control.vue'
import ValueSelector from '../../../renderer/components/basic/value-selector.vue'
import { useDiscoveredAddons } from '../../../renderer/hooks/settings'
import type { SettingsSpec } from '../../../typings/settings'

export interface SettingsLineAPI {
  isCollapsed: boolean,
}

export default {
  name: 'settings-line',
  components: {
    SwitchControl,
    ObjectEditor,
    ValueSelector,
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
  setup(props, { emit, expose }) {
    const isCollapsedRef = ref(false)

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

    const discoveredAddonsRef = useDiscoveredAddons()

    const recommendationsRef = computed(() => {
      const recommendations = props.spec.recommendations
      if (props.spec.key === 'terminal.addon.includes') {
        const discoveredAddons = unref(discoveredAddonsRef)
        return [
          ...recommendations!,
          ...Object.keys(discoveredAddons)
            .filter(name => discoveredAddons[name].type === 'user'),
        ]
      }
      return recommendations
    })

    function getNote(item: EditorEntryItem) {
      if (props.spec.key === 'terminal.addon.includes') {
        const discoveredAddons = unref(discoveredAddonsRef)
        const info = discoveredAddons[item.entry.value]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return info?.manifest?.description ?? ''
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
      isCollapsedRef.value = !isCollapsedRef.value
    }

    function reset() {
      modelRef.value = props.spec.default
    }

    expose({
      isCollapsed: isCollapsedRef,
    })

    return {
      isCollapsed: isCollapsedRef,
      isSimpleObject: isSimpleObjectRef,
      placeholder: placeholderRef,
      model: modelRef,
      isCustomized: isCustomizedRef,
      isChanged: isChangedRef,
      hasNotes: hasNotesRef,
      recommendations: recommendationsRef,
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
  }
}
.item-label {
  user-select: text;
  .form-label.customized & {
    font-style: italic;
  }
  .form-label.changed & {
    color: rgb(var(--design-yellow));
  }
}
.item-key {
  margin-left: 16px;
  font-size: 12px;
  opacity: 0.5;
  user-select: text;
  .form-label.customized & {
    font-style: italic;
  }
  .form-label.changed & {
    color: rgb(var(--design-yellow));
  }
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
