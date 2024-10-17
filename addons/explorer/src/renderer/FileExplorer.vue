<script lang="ts" setup>
import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import { nextTick, watch, watchEffect } from 'vue'
import { FileEntity } from '../types/file'

const { VisualIcon } = commas.ui.vueAssets
const settings = commas.remote.useSettings()

let modelValue = $(defineModel<string>({ default: '' }))

interface Breadcrumb {
  path: string,
  base: string,
}

function splitDirectory(directory: string): Breadcrumb[] {
  const parsed = path.parse(directory)
  if (!parsed.base) return [{ path: directory, base: directory }]
  return [...splitDirectory(parsed.dir), {
    path: directory,
    base: parsed.base + path.sep,
  }]
}

const breadcrumbs = $computed(() => {
  return splitDirectory(modelValue)
})

let entities = $ref<FileEntity[]>([])

watchEffect(async () => {
  entities = await ipcRenderer.invoke('read-directory', modelValue)
})

const isUnixLike = process.platform !== 'win32'

let isDotFilesVisible = $ref(false)

function toggleDotFiles() {
  isDotFilesVisible = !isDotFilesVisible
}

const files = $computed(() => {
  let result = entities
  if (!isDotFilesVisible) {
    result = entities.filter(entity => {
      if (entity.name.startsWith('.')) return false
      return true
    })
  }
  return result
})

function selectFile(event: MouseEvent, file: FileEntity) {
  if (file.isDirectory) {
    modelValue = file.path
  } else {
    commas.ui.openItem(file.path, event)
  }
}

function showSymlink(file: FileEntity) {
  if (!file.symlink) return
  modelValue = path.dirname(file.symlink)
}

let previousValue = $ref<string>()

watch($$(modelValue), (value, oldValue) => {
  if (oldValue !== undefined) {
    previousValue = oldValue
  } else if (previousValue === undefined) {
    previousValue = value
  }
}, { immediate: true })

const hasPreviousValue = $computed(() => {
  return previousValue !== undefined && previousValue !== modelValue
})

function goBack() {
  if (previousValue !== undefined) {
    modelValue = previousValue
  }
}

function openExternal(file: FileEntity) {
  if (file.isDirectory) {
    commas.remote.openFileExternally(file.path)
  } else {
    commas.remote.showFileExternally(file.path)
  }
}

const externalExplorer = $computed(() => {
  return settings['terminal.external.explorer']
})

function openExternalExplorer() {
  if (!openExternalExplorer) {
    return openDirectory()
  }
  const explorer = externalExplorer
    .replace(/\$\{directory\}/g, modelValue)
  return ipcRenderer.invoke('execute', explorer)
}

function openDirectory() {
  commas.remote.openFileExternally(modelValue)
}

function openNewTab() {
  commas.workspace.createTerminalTab({ cwd: modelValue })
}

let isCustomizing = $ref(false)
let customDirectory = $ref('')
let customDirectoryElement = $ref<HTMLInputElement>()

watchEffect(() => {
  customDirectory = modelValue
})

async function startCustomization() {
  isCustomizing = true
  await nextTick()
  if (customDirectoryElement) {
    customDirectoryElement.select()
  }
}

async function customize() {
  if (customDirectory !== modelValue) {
    const value = await ipcRenderer.invoke('access-directory', customDirectory)
    if (value) {
      modelValue = value
    }
  }
  isCustomizing = false
}

function resetCustomization() {
  customDirectory = modelValue
  isCustomizing = false
}

function startDragging(event: DragEvent, fileOrBreadcrumb: FileEntity | Breadcrumb) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', fileOrBreadcrumb.path)
  }
  ipcRenderer.invoke('drag-file', fileOrBreadcrumb.path)
}

function selectBreadcrumb(breadcrumb: Breadcrumb) {
  modelValue = breadcrumb.path
}

function autoselect(event: FocusEvent) {
  (event.target as HTMLInputElement).select()
}
</script>

<template>
  <div class="file-explorer">
    <div class="form-line action-line">
      <slot></slot>
      <span :class="['link', 'form-action', { disabled: !hasPreviousValue }]" @click="goBack">
        <VisualIcon name="lucide-undo-2" />
      </span>
      <form v-if="isCustomizing" class="breadcrumb-form" @submit.prevent="customize">
        <input
          ref="customDirectoryElement"
          v-model="customDirectory"
          class="custom-directory"
          autofocus
          @focus="autoselect"
          @blur="resetCustomization"
          @keydown.esc="resetCustomization"
        >
      </form>
      <span v-else class="breadcrumb-list">
        <span
          v-for="breadcrumb in breadcrumbs"
          :key="breadcrumb.path"
          draggable="true"
          class="link form-action breadcrumb"
          @click="selectBreadcrumb(breadcrumb)"
          @dragstart.prevent="startDragging($event, breadcrumb)"
        >{{ breadcrumb.base }}</span>
        <span class="link form-action breadcrumb" @click="startCustomization">
          <VisualIcon name="lucide-pen" />
        </span>
      </span>
      <span v-if="isUnixLike" class="link form-action" @click="toggleDotFiles">
        <VisualIcon :name="isDotFilesVisible ? 'lucide-eye' : 'lucide-eye-closed'" />
      </span>
      <span class="link form-action" @click="openNewTab">
        <VisualIcon name="lucide-terminal" />
      </span>
      <span v-if="externalExplorer" class="link form-action" @click="openExternalExplorer">
        <VisualIcon name="lucide-square-arrow-out-up-right" />
      </span>
      <span class="link form-action" @click="openDirectory">
        <VisualIcon :name="externalExplorer ? 'lucide-folder-open' : 'lucide-square-arrow-out-up-right'" />
      </span>
    </div>
    <div class="file-list">
      <a
        v-for="file in files"
        :key="file.name"
        draggable="true"
        :class="['file', { directory: file.isDirectory }]"
        @click="selectFile($event, file)"
        @dragstart.prevent="startDragging($event, file)"
      >
        <VisualIcon
          :name="file.symlink
            ? (file.isDirectory ? 'lucide-folder-symlink' : 'lucide-file-symlink')
            : (file.isDirectory ? 'lucide-folder' : 'lucide-file')"
          class="file-icon"
        />
        <span class="file-name">{{ file.name }}{{ file.isDirectory ? path.sep : '' }}</span>
        <span class="action-list">
          <span
            v-if="file.symlink"
            class="link form-action"
            @click.stop="showSymlink(file)"
          >
            <VisualIcon name="lucide-iteration-ccw" />
          </span>
          <span
            class="link form-action"
            @click.stop="openExternal(file)"
          >
            <VisualIcon name="lucide-square-arrow-out-up-right" />
          </span>
        </span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

.action-line {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px #{8px - math.div(24px - 16px, 2)} 0;
  background: rgb(var(--theme-background) / var(--theme-opacity));
}
.breadcrumb-form {
  display: flex;
  flex: 1;
  min-width: 0;
}
.custom-directory {
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
.breadcrumb-list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-width: 0;
}
.breadcrumb {
  width: auto;
  padding: 0 4px;
  font-size: 12px;
}
.file-list {
  display: flex;
  flex-direction: column;
  margin-top: 4px;
}
.file {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  transition: transform 0.2s;
  &:hover {
    background: var(--design-highlight-background);
  }
  &:active {
    transform: scale(0.99);
  }
  &.directory {
    .file-icon {
      color: rgb(var(--system-blue));
      fill: rgb(var(--system-blue) / 50%);
    }
  }
}
.file-name {
  flex: 1;
  min-width: 0;
}
.action-list {
  display: flex;
  flex: none;
  gap: 4px;
  align-items: center;
  .file:not(:hover) & {
    visibility: hidden;
  }
  .form-action {
    width: 20px;
    height: 20px;
    font-size: 14px;
  }
}
</style>
