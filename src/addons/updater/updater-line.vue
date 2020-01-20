<template>
  <div class="form-line updater-line">
    <label class="form-label" v-i18n>Enable auto updating#!22</label>
    <switch-control :checked="enabled" @change="toggle"></switch-control>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import hooks from '@/hooks'

export default {
  name: 'UpdaterLine',
  components: {
    'switch-control': hooks.workspace.components.SwitchControl,
  },
  computed: {
    ...mapState('updater', ['enabled']),
  },
  methods: {
    ...mapActions('updater', ['toggle']),
  },
}
</script>
