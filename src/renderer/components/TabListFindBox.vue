<script lang="ts" setup>
import { useTabListFindingKeyword } from '../compositions/terminal'
import { vI18n } from '../utils/i18n'
import VisualIcon from './basic/VisualIcon.vue'

let keyword = $(useTabListFindingKeyword())
</script>

<template>
  <div class="tab-list-find-box">
    <div class="search-bar" data-commas>
      <VisualIcon name="lucide-search" class="icon"></VisualIcon>
      <input
        v-model="keyword"
        v-i18n:placeholder
        type="search"
        placeholder="Find#!terminal.5"
        autofocus
        data-commas-alt
        class="keyword"
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-list-find-box {
  padding-right: 8px;
}
.search-bar {
  display: flex;
  gap: 4px;
  align-items: center;
  border-radius: 8px;
}
.icon {
  opacity: 0.5;
}
.keyword {
  flex: 1;
  width: 0;
}
</style>
