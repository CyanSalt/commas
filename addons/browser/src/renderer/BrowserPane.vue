<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import normalizeURL from 'normalize-url'
import { useTemplateRef, watchEffect } from 'vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalPane, WebContents, VisualIcon, vI18n } = commas.ui.vueAssets

let url = $computed({
  get: () => tab.command,
  set: value => {
    // eslint-disable-next-line vue/no-mutating-props
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

let customURL: string | undefined = $ref<string>()
let customURLElement = $(useTemplateRef<HTMLInputElement>('customURLElement'))

watchEffect(() => {
  customURL = url
})

async function customize() {
  if (customURL && customURL !== url) {
    url = normalizeURL(customURL, {
      defaultProtocol: 'https',
      stripTextFragment: false,
      stripWWW: false,
      removeQueryParameters: false,
      removeTrailingSlash: false,
      removeSingleSlash: false,
      sortQueryParameters: false,
    })
  }
}

function resetCustomization() {
  customURL = url
}

function autoselect(event: FocusEvent) {
  (event.target as HTMLInputElement).select()
}

function openExternal() {
  if (!url) return
  commas.remote.openURLExternally(url)
}

watchEffect((onInvalidate) => {
  if (view) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.iconURL = view.icon
    onInvalidate(() => {
      // eslint-disable-next-line vue/no-mutating-props
      delete tab.iconURL
    })
  }
})

const viewId = $computed(() => {
  if (!view) return undefined
  return view.id
})

watchEffect((onInvalidate) => {
  if (tab.pane) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.pane.instance = {
      viewId,
    }
    onInvalidate(() => {
      if (tab.pane) {
        // eslint-disable-next-line vue/no-mutating-props
        delete tab.pane.instance
      }
    })
  }
})
</script>

<template>
  <TerminalPane :tab="tab" class="browser-pane">
    <div class="browser-view">
      <nav data-commas :class="['action-line', { 'is-loading': view?.loading }]">
        <button type="button" data-commas :class="['browser-action', { disabled: !view?.canGoBack }]" @click="goBack">
          <VisualIcon name="lucide-undo-2" />
        </button>
        <form class="custom-url-form" @submit.prevent="customize">
          <input
            ref="customURLElement"
            v-model="customURL"
            v-i18n:placeholder
            class="custom-url"
            placeholder="Enter URL...#!browser.4"
            autofocus
            @focus="autoselect"
            @keydown.esc="resetCustomization"
          >
        </form>
        <button type="button" data-commas :class="['browser-action', { disabled: !url }]" @click="openExternal">
          <VisualIcon name="lucide-square-arrow-out-up-right" />
        </button>
      </nav>
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
@keyframes background-continuous {
  from {
    background-position: right;
  }
}
.action-line {
  flex: none;
  padding: 8px;
  &.is-loading {
    background: linear-gradient(to right, transparent 25%, var(--design-highlight-background), transparent 66.6667%);
    background-size: 300% 100%;
    animation: background-continuous 1s infinite linear;
  }
}
.browser-action {
  padding: 2px;
  font-size: 14px;
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
.web-page {
  flex: 1;
  min-height: 0;
  margin: 0 2px 2px;
}
</style>
