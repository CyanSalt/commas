<template>
  <div class="tab-list">
    <div class="list">
      <div :class="['tab', {active: active === index}]"
        v-for="(tab, index) in tabs" :key="tab.id" @click="activite(index)">
        <div class="tab-overview">
          <div class="tab-name">{{ tab.process }}</div>
          <div class="operations">
            <div class="close" @click="close(index)">
              <span class="feather-icon icon-x"></span>
            </div>
          </div>
        </div>
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
    close: VueMaye.action('terminal.close'),
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
}
.tab-list .tab-name,
.tab-list .tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.5;
}
.tab-list .tab.active .tab-name,
.tab-list .tab.active .tab-title {
  opacity: 1;
}
.tab-list .tab-overview {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  height: 32px;
  line-height: 32px;
}
.tab-list .operations {
  flex: none;
  display: none;
}
.tab-list .tab:hover .operations {
  display: flex;
}
.tab-list .close {
  cursor: pointer;
  transition: color 0.2s;
}
.tab-list .close:hover {
  color: var(--theme-brightred);
}
.tab-list .divider {
  height: 1px;
  margin: 8px 0;
  border-bottom: 2px solid;
  opacity: 0.05;
}
.tab-list .new-tab {
  height: 42px;
  line-height: 42px;
  font-size: 28px;
  text-align: center;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.tab-list .new-tab:hover {
  opacity: 1;
}
</style>
