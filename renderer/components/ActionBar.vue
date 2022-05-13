<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { watchEffect } from 'vue'
import * as commas from '../../api/core-renderer'
import { useCurrentTerminal } from '../compositions/terminal'

const anchors = commas.proxy.context.getCollection('@ui-action-anchor')

const terminal = $(useCurrentTerminal())

let branch = $ref('')

const directory = $computed(() => {
  if (!terminal || terminal.pane) return ''
  return terminal.cwd
})

async function updateBranch() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (directory) {
    branch = await ipcRenderer.invoke('get-git-branch', directory)
  } else {
    branch = ''
  }
}

watchEffect(() => {
  branch = ''
  updateBranch()
})

function configure() {
  ipcRenderer.invoke('open-settings')
}
</script>

<template>
  <footer class="action-bar">
    <div class="anchor-list">
      <div class="anchor" @click="configure">
        <span class="feather-icon icon-settings"></span>
      </div>
      <component
        :is="anchor"
        v-for="(anchor, index) in anchors"
        :key="index"
        class="anchor"
      />
    </div>
    <div class="git-branch">
      <span class="anchor" @click="updateBranch">
        <span class="feather-icon icon-git-branch"></span>
      </span>
      <span v-if="branch" class="branch-name">{{ branch }}</span>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex: none;
  justify-content: space-between;
  height: 16px;
  padding: 8px 16px;
  line-height: 16px;
  background: rgb(var(--theme-background));
}
.anchor-list {
  display: flex;
  .anchor {
    margin-right: 8px;
  }
}
.anchor {
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
.git-branch {
  display: flex;
  box-sizing: border-box;
}
.branch-name {
  margin-left: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  opacity: 0.5;
}
</style>
