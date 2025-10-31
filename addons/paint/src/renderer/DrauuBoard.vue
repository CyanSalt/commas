<script lang="ts" setup>
import { useClipboardItems, useEventListener } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import { createDrauu } from 'drauu'
import { useTemplateRef, watchEffect } from 'vue'

const { VisualIcon } = commas.ui.vueAssets

const graphic = $(useTemplateRef('graphic'))

const drauu = $computed(() => createDrauu({
  el: graphic ?? undefined,
}))

const theme = commas.remote.useTheme()
watchEffect(() => {
  drauu.brush.color = theme.foreground
})

const UNDO_OR_REDO = commas.ui.toKeyEvent('CmdOrCtrl+Z')

useEventListener(window, 'keydown', event => {
  if (commas.ui.isMatchKeyEvent(event, UNDO_OR_REDO)) {
    if (event.shiftKey) {
      drauu.redo()
    } else {
      drauu.undo()
    }
  }
})

let canUndo = $ref(false)
let canRedo = $ref(false)
watchEffect(() => {
  drauu.on('changed', () => {
    canUndo = drauu.canUndo()
    canRedo = drauu.canRedo()
  })
})

let isErasing = $ref(false)
watchEffect(() => {
  drauu.mode = isErasing ? 'eraseLine' : 'stylus'
})

function undo() {
  drauu.undo()
}

function redo() {
  drauu.redo()
}

function erase(value: boolean) {
  isErasing = value
}

function clear() {
  drauu.clear()
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  return { canvas, context }
}

async function loadImage(url: string) {
  const image = new Image()
  image.src = url
  await commas.ui.loadingElement(image)
  return image
}

async function convertImage(image: HTMLImageElement, type: string, width: number, height: number) {
  const { canvas, context } = createCanvas(width, height)
  context.fillStyle = theme.background
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)
  return new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, type)
  })
}

const { copied, copy: copyToClipboard } = $(useClipboardItems())

async function copy() {
  if (!graphic) return
  const cloned = graphic.cloneNode(true) as SVGElement
  const baseWidth = graphic.width.baseVal.value
  const baseHeight = graphic.height.baseVal.value
  const actualWidth = baseWidth * devicePixelRatio
  const actualHeight = baseHeight * devicePixelRatio
  cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  cloned.setAttribute('viewBox', `0 0 ${baseWidth} ${baseHeight}`)
  cloned.setAttribute('width', String(actualWidth))
  cloned.setAttribute('height', String(actualHeight))
  const data = cloned.outerHTML
  let blob = new Blob([data], {
    type: 'image/svg+xml',
  })
  const url = URL.createObjectURL(blob)
  const image = await loadImage(url)
  const converted = await convertImage(
    image,
    'image/png',
    actualWidth,
    actualHeight,
  )
  if (converted) {
    blob = converted
  }
  await copyToClipboard([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ])
}
</script>

<template>
  <div class="drauu-board">
    <div class="drauu-action-bar">
      <nav data-commas class="drauu-action-area">
        <button type="button" data-commas class="drauu-action" :disabled="!canUndo" @click="undo">
          <VisualIcon name="lucide-undo" />
        </button>
        <button type="button" data-commas class="drauu-action" :disabled="!canRedo" @click="redo">
          <VisualIcon name="lucide-redo" />
        </button>
        <button type="button" data-commas :class="['drauu-action', { active: !isErasing }]" @click="erase(false)">
          <VisualIcon name="lucide-pencil-line" />
        </button>
        <button type="button" data-commas :class="['drauu-action', { active: isErasing }]" @click="erase(true)">
          <VisualIcon name="lucide-eraser" />
        </button>
      </nav>
      <nav data-commas class="drauu-action-area">
        <button type="button" data-commas class="drauu-action clear" @click="clear">
          <VisualIcon name="lucide-brush-cleaning" />
        </button>
        <button type="button" data-commas class="drauu-action" @click="copy">
          <VisualIcon v-if="copied" name="lucide-clipboard-check" />
          <VisualIcon v-else name="lucide-clipboard-copy" />
        </button>
      </nav>
    </div>
    <svg v-once ref="graphic" class="drauu-element" />
  </div>
</template>

<style lang="scss" scoped>
.drauu-board {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.drauu-action-bar {
  display: flex;
  flex: none;
  justify-content: space-between;
  padding: 8px;
}
.drauu-element {
  flex: 1;
  min-height: 0;
}
.drauu-action {
  &.active {
    color: var(--design-highlight-color);
    opacity: 1;
    &.system {
      color: rgb(var(--system-purple));
    }
  }
}
.clear {
  color: rgb(var(--system-red));
}
</style>
