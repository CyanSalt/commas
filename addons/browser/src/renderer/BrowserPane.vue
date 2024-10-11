<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { shell } from 'electron'
import { nextTick, watchEffect } from 'vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalPane, WebContents, VisualIcon } = commas.ui.vueAssets

let url = $computed({
  get: () => tab.command,
  set: value => {
    Object.assign(tab, {
      command: value,
    })
  },
})

let view = $ref<commas.ui.RendererWebContentsView>()

function initialize(current: commas.ui.RendererWebContentsView) {
  view = current
}

watchEffect(onInvalidate => {
  if (view) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.title = view.title || ''
    onInvalidate(() => {
      // eslint-disable-next-line vue/no-mutating-props
      tab.title = ''
    })
  }
})

function goBack() {
  if (!view) return
  view.goToOffset(-1)
}

let isCustomizing = $ref(false)
let customURL: string | undefined = $ref<string>()
let customURLElement = $ref<HTMLInputElement>()

watchEffect(() => {
  customURL = url
})

async function startCustomization() {
  isCustomizing = true
  await nextTick()
  if (customURLElement) {
    customURLElement.select()
  }
}

async function customize() {
  if (customURL !== url) {
    url = customURL
  }
  isCustomizing = false
}

function resetCustomization() {
  customURL = url
  isCustomizing = false
}

function autoselect(event: FocusEvent) {
  (event.target as HTMLInputElement).select()
}

function openExternal() {
  if (!url) return
  shell.openExternal(url)
}

watchEffect((onInvalidate) => {
  if (tab.pane) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.iconURL = view?.icon
    onInvalidate(() => {
      if (tab.pane) {
        // eslint-disable-next-line vue/no-mutating-props
        delete tab.iconURL
      }
    })
  }
})
</script>

<template>
  <TerminalPane :tab="tab" class="browser-pane">
    <div class="browser-view">
      <div class="form-line action-line">
        <span :class="['link', 'form-action', { disabled: !view?.canGoBack }]" @click="goBack">
          <VisualIcon name="lucide-undo-2" />
        </span>
        <form v-if="isCustomizing" class="custom-url-form" @submit.prevent="customize">
          <input
            ref="customURLElement"
            v-model="customURL"
            class="custom-url"
            autofocus
            @focus="autoselect"
            @blur="resetCustomization"
            @keydown.esc="resetCustomization"
          >
        </form>
        <span v-else class="page-url" @click="startCustomization">{{ url }}</span>
        <span :class="['link', 'form-action', { disabled: !url }]" @click="openExternal">
          <VisualIcon name="lucide-square-arrow-out-up-right" />
        </span>
      </div>
      <WebContents
        v-model="url"
        class="web-page"
        @initialize="initialize"
      />
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.browser-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.browser-pane {
  padding: 0;
  overflow: visible;
}
.action-line {
  flex: none;
  gap: 4px;
  padding: 8px;
  .form-action {
    width: 18px;
    height: 18px;
    font-size: 14px;
  }
}
.custom-url-form {
  display: flex;
  flex: 1;
  min-width: 0;
}
.custom-url {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  background: transparent;
  outline: none;
}
.page-url {
  display: flex;
  flex: 1;
  align-self: stretch;
  align-items: center;
  min-width: 0;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.web-page {
  flex: 1;
  min-height: 0;
}
</style>
