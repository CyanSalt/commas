<script lang="ts" setup>
import '@fontsource/montserrat/500.css'
import { ipcRenderer } from '@commas/electron-ipc'
import { useClipboardItems } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import osName from 'os-name'
import icon from './assets/icon-stroked.svg'

const { VisualIcon } = commas.ui.vueAssets
const theme = commas.remote.useTheme()

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
  return commas.ui.loadingElement(image)
}

interface Rect {
  x: number,
  y: number,
  width: number,
  height: number,
}

function roundCorners(
  context: CanvasRenderingContext2D,
  rect: Rect,
  radius: number,
) {
  const { x, y, width, height } = rect
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
}

async function createIconCanvas(color: string) {
  const size = 24 * devicePixelRatio
  const image = await loadImage(icon)
  const { canvas, context } = createCanvas(size, size)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const data = context.getImageData(0, 0, canvas.width, canvas.height)
  const bytes = data.data
  const rgba = commas.helper.toRGBA(color)
  for (let i = 0; i < bytes.length; i += 4) {
    bytes[i] = rgba.r
    bytes[i + 1] = rgba.g
    bytes[i + 2] = rgba.b
    bytes[i + 3] = bytes[i + 3] * rgba.a
  }
  context.putImageData(data, 0, 0)
  return canvas
}

async function createTextCanvas(color: string) {
  const textContent = `Commas on ${osName()}`
  const size = 12 * devicePixelRatio
  const fontFamily = 'Montserrat'
  const fontWeight = '500'
  const fontStyle = `${fontWeight} ${size}px ${fontFamily}`
  await Promise.all(Array.from(document.fonts, async font => {
    if (font.family === fontFamily && font.weight === fontWeight) {
      return font.load()
    }
  }))
  const { canvas, context } = createCanvas(300, 150)
  context.font = fontStyle
  const { width } = context.measureText(textContent)
  canvas.width = width
  canvas.height = size
  context.save()
  context.font = fontStyle
  context.fillStyle = color
  context.textBaseline = 'middle'
  context.fillText(textContent, 0, size / 2)
  context.restore()
  return canvas
}

const { copied, copy } = $(useClipboardItems())

async function capture() {
  const activeElement = document.querySelector('.terminal-view > .active')
  if (!activeElement) return
  const { x, y, width, height } = activeElement.getBoundingClientRect()
  const screenshot = await ipcRenderer.invoke('capture-page', { x, y, width, height })
  const size = screenshot.getSize()
  const { canvas, context } = createCanvas(
    size.width + 128 * devicePixelRatio,
    size.height + 128 * devicePixelRatio,
  )
  const watermarkColor = 'rgb(255 255 255 / 75%)'
  const iconCanvas = await createIconCanvas(watermarkColor)
  const textCanvas = await createTextCanvas(watermarkColor)
  const screenshotImage = await loadImage(screenshot.toDataURL())
  // Gradient background
  context.save()
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  const systemAccentRGBA = commas.helper.toRGBA(theme.systemAccent)
  const backgroundRGBA = commas.helper.toRGBA(theme.background)
  gradient.addColorStop(0, commas.helper.toCSSHEX(commas.helper.mix(systemAccentRGBA, backgroundRGBA, 0.12)))
  gradient.addColorStop(1, commas.helper.toCSSHEX(commas.helper.mix(systemAccentRGBA, backgroundRGBA, 0.48)))
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.restore()
  // Translucent border
  context.save()
  context.beginPath()
  context.fillStyle = commas.helper.toCSSHEX({ ...backgroundRGBA, a: 0.5 })
  context.shadowOffsetX = 0
  context.shadowOffsetY = 2 * devicePixelRatio
  context.shadowBlur = 4 * devicePixelRatio
  context.shadowColor = 'rgb(0 0 0 / 10%)'
  roundCorners(
    context,
    {
      x: (canvas.width - (size.width + 8 * devicePixelRatio)) / 2,
      y: (canvas.height - (size.height + 8 * devicePixelRatio)) / 2,
      width: size.width + 8 * devicePixelRatio,
      height: size.height + 8 * devicePixelRatio,
    },
    (8 + 8 / 2) * devicePixelRatio,
  )
  context.fill()
  context.closePath()
  context.clip()
  context.restore()
  // Screenshot
  context.save()
  context.beginPath()
  context.fillStyle = theme.background
  roundCorners(
    context,
    {
      x: (canvas.width - size.width) / 2,
      y: (canvas.height - size.height) / 2,
      width: size.width,
      height: size.height,
    },
    8 * devicePixelRatio,
  )
  context.fill()
  context.closePath()
  context.clip()
  context.drawImage(
    screenshotImage,
    (canvas.width - size.width) / 2,
    (canvas.height - size.height) / 2,
  )
  context.restore()
  const spacing = 4 * devicePixelRatio
  const watermarkSize = iconCanvas.width + spacing + textCanvas.width
  // Watermark icon
  context.save()
  context.drawImage(
    iconCanvas,
    canvas.width / 2 - watermarkSize / 2,
    canvas.height - (canvas.height - size.height) / 4 - iconCanvas.height / 2,
  )
  context.restore()
  // Watermark text
  context.save()
  context.drawImage(
    textCanvas,
    canvas.width / 2 - watermarkSize / 2 + iconCanvas.width + spacing,
    canvas.height - (canvas.height - size.height) / 4 - textCanvas.height / 2,
  )
  context.restore()
  const blob = await new Promise<Blob>(resolve => canvas.toBlob(value => resolve(value!), 'image/png'))
  await copy([
    new ClipboardItem({
      'image/png': blob,
    }),
  ])
}
</script>

<template>
  <button
    type="button"
    data-commas
    class="camera-anchor"
    @click="capture"
  >
    <VisualIcon v-if="copied" name="lucide-clipboard-check" />
    <VisualIcon v-else name="lucide-camera" />
  </button>
</template>
