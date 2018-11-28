<template>
  <div class="tab-list">
    <div class="list">
      <div :class="['tab', {active: active === index}]"
        v-for="(tab, index) in tabs" :key="tab.id" @click="activite(index)">
        <div class="tab-name">{{ tab.process }}</div>
        <div class="tab-title">{{ tab.title || tab.id }}</div>
        <div class="divider"></div>
      </div>
      <div class="new-tab" @click="spawn">
        <span class="feather-icon icon-plus"></span>
      </div>
    </div>
    <div class="sash"></div>
  </div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'

export default {
  name: 'tab-list',
  computed: {
    tabs: VueMaye.state('terminal.tabs'),
    active: VueMaye.state('terminal.active'),
  },
  methods: {
    spawn: VueMaye.action('terminal.spawn'),
    activite: VueMaye.action('terminal.activite'),
  },
}
</script>

<style>
.tab-list {
  flex: none;
  /* width: 180px; */
  display: flex;
  font-size: 14px;
}
.tab-list .list {
  flex: auto;
  padding: 4px 16px;
}
.tab-list .sash {
  flex: none;
  width: 2px;
  margin: 4px 0;
  border-right: 2px solid;
  opacity: 0.05;
}
.tab-list .tab {
  width: 144px;
  opacity: 0.5;
}
.tab-list .tab.active {
  opacity: 1;
}
.tab-list .tab-name,
.tab-list .tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-list .tab-name {
  font-size: 18px;
  height: 32px;
  line-height: 32px;
}
.tab-list .divider {
  height: 1px;
  margin: 8px 0;
  border-bottom: 2px solid;
  opacity: 0.1;
}
.tab-list .tab.active .divider {
  opacity: 0.05;
}
.tab-list .new-tab {
  height: 42px;
  line-height: 42px;
  font-size: 28px;
  text-align: center;
  opacity: 0.5;
}
</style>
