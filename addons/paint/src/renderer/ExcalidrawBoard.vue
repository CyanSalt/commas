<script lang="ts" setup>
import * as path from 'node:path'
import * as commas from 'commas:api/renderer'
import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { watch, watchEffect } from 'vue'
import type { ExcalidrawImperativeAPI, State } from './excalidraw'
import { Excalidraw, exportToBlob, exportToSvg, hashElementsVersion, loadFromBlob, serializeAsJSON } from './excalidraw'
import { useVueRef } from './react'

const { file } = defineProps<{
  file?: string,
}>()

let modelValue = $(defineModel<string>())

const type = $computed(() => {
  const ext = file ? path.extname(file) : undefined
  switch (ext) {
    case '.svg': return 'svg'
    case '.png': return 'png'
    default: return 'json'
  }
})

const contentType = $computed(() => {
  switch (type) {
    case 'svg': return 'image/svg+xml'
    case 'png': return 'image/png'
    default: return 'application/json'
  }
})

let excalidraw = $ref<ExcalidrawImperativeAPI>()

const data = $(commas.helper.useAsyncComputed<State>(async () => {
  if (!modelValue) return undefined
  return loadFromBlob(
    new Blob([
      type === 'png' ? new TextEncoder().encode(modelValue) : modelValue,
    ], { type: contentType }),
    excalidraw ? excalidraw.getAppState() : null,
    excalidraw ? excalidraw.getSceneElements() : null,
  )
}))

watch($$(data), value => {
  if (!value) return
  if (!excalidraw) return
  excalidraw.updateScene({
    elements: value.elements,
    appState: {
      ...value.appState,
      isLoading: false,
    },
  })
  excalidraw.addFiles(Object.values(value.files))
})

function getVersion(value: State | undefined) {
  return value ? hashElementsVersion(value.elements) : -1
}

const version = $computed(() => getVersion(data))

let state = $ref<State>()

watchEffect(() => {
  state = data
})

let element = $ref<HTMLElement>()

let root = $ref<Root>()

watchEffect(onInvalidate => {
  if (!element) return
  const instance = createRoot(element)
  root = instance
  onInvalidate(() => {
    instance.unmount()
  })
})

const isLightTheme = commas.remote.useIsLightTheme()

const ExcalidrawApp = () => {
  const isLight = useVueRef(isLightTheme)
  return React.createElement(Excalidraw, {
    initialData: state,
    excalidrawAPI: api => {
      excalidraw = api
    },
    onChange: (elements, appState, files) => {
      state = {
        elements,
        appState: { ...appState, exportEmbedScene: true },
        files,
      }
    },
    UIOptions: {
      canvasActions: {
        changeViewBackgroundColor: false,
        export: false,
        loadScene: false,
        saveToActiveFile: false,
        toggleTheme: false,
        saveAsImage: false,
      },
    },
    langCode: navigator.language,
    name: file,
    theme: isLight ? 'light' : 'dark',
  })
}

watchEffect(() => {
  if (!root) return
  root.render(React.createElement(ExcalidrawApp))
})

async function exportState(value: State | undefined) {
  const latestVersion = value ? hashElementsVersion(value.elements) : -1
  if (latestVersion === version) return
  switch (type) {
    case 'svg': {
      const svg = value ? await exportToSvg(value) : undefined
      return svg ? svg.outerHTML : ''
    }
    case 'png': {
      const blob = value ? await exportToBlob(value) : undefined
      return blob ? await blob.text() : ''
    }
    default: {
      return value
        ? serializeAsJSON(value.elements, value.appState, value.files, 'local')
        : ''
    }
  }
}

const isDirty = $computed(() => {
  return getVersion(state) !== version
})

async function save() {
  modelValue = await exportState(state)
}

defineExpose({
  isDirty: $$(isDirty),
  save,
})
</script>

<template>
  <div ref="element" class="excalidraw-board"></div>
</template>

<style lang="scss" scoped>
.excalidraw-board {
  width: 100%;
  height: 100%;
}
</style>
