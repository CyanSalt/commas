<template>
  <div class="form-line">
    <label class="form-label" v-i18n>{{ spec.label }}</label>
    <switch-control v-if="spec.type === 'boolean'" v-model="model"></switch-control>
    <input v-else-if="spec.type === 'number'" v-model="model" :placeholder="placeholder"
      type="number" class="form-control">
    <input v-else-if="spec.type === 'string'" v-model="model" :placeholder="placeholder"
      type="text" class="form-control">
    <textarea v-else v-model="model" :placeholder="placeholder"
      class="form-control"></textarea>
  </div>
</template>

<script>
import hooks from '@/hooks'

export default {
  name: 'UserSettingsLine',
  components: {
    ...hooks.workspace.component.pick([
      'switch-control',
    ]),
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    spec: {
      type: Object,
      required: true,
    },
    value: {
      required: true,
    },
  },
  computed: {
    model: {
      get() {
        if (this.value === undefined && this.spec.type === 'boolean') {
          return this.placeholder
        }
        return this.flattern(this.value)
      },
      set(value) {
        this.$emit('change', this.format(value))
      },
    },
    placeholder() {
      return this.flattern(this.spec.default)
    },
  },
  methods: {
    accepts(type) {
      return this.spec.type === type || (
        Array.isArray(this.spec.type) && this.spec.type.includes(type)
      )
    },
    parse(value) {
      try {
        return JSON.parse(value)
      } catch {
        return undefined
      }
    },
    flattern(value) {
      if (this.accepts('array') && Array.isArray(value)) {
        return JSON.stringify(value)
      }
      if (this.accepts('map') && typeof value === 'object') {
        return JSON.stringify(value)
      }
      return value
    },
    format(value) {
      if (this.accepts('map')) {
        const parsed = this.parse(value)
        if (typeof parsed === 'object') {
          return parsed
        }
      }
      if (this.accepts('array')) {
        const parsed = this.parse(value)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
      if (this.accepts('number')) {
        const parsed = this.parse(value)
        if (typeof parsed === 'number') {
          return parsed
        }
      }
      if (!this.accepts('string') && !value) {
        return undefined
      }
      return value
    },
  },
}
</script>

<style>
