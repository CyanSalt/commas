<script lang="ts" setup>
import { useTabListFindingKeyword } from '../compositions/terminal'
import { vI18n } from '../utils/i18n'

let keyword = $(useTabListFindingKeyword())
</script>

<template>
  <div class="tab-list-find-box">
    <input
      v-model="keyword"
      v-i18n:placeholder
      type="search"
      placeholder="Find#!terminal.5"
      autofocus
      data-commas
      class="keyword"
    >
  </div>
</template>

<style lang="scss" scoped>
.tab-list-find-box {
  display: flex;
  padding-right: 8px;
}
.keyword {
  flex: 1;
  width: 0;
  border-radius: 8px;
}
</style>
