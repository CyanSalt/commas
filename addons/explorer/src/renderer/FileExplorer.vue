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

let container = $ref<HTMLElement>()
let back = $ref<HTMLButtonElement>()

watchEffect(async () => {
  if (files.length) {
    await nextTick()
    container?.querySelector<HTMLAnchorElement>('.file')?.focus()
  } else {
    back?.focus()
  }
})
</script>

<template>
  <div class="file-explorer">
    <nav data-commas class="action-line">
      <slot></slot>
      <button ref="back" type="button" data-commas :disabled="!hasPreviousValue" @click="goBack">
        <VisualIcon name="lucide-undo-2" />
      </button>
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
        <button
          v-for="breadcrumb in breadcrumbs"
          :key="breadcrumb.path"
          type="button"
          data-commas
          draggable="true"
          class="breadcrumb"
          @click="selectBreadcrumb(breadcrumb)"
          @dragstart.prevent="startDragging($event, breadcrumb)"
        >{{ breadcrumb.base }}</button>
        <button type="button" data-commas class="breadcrumb" @click="startCustomization">
          <VisualIcon name="lucide-pen" />
        </button>
      </span>
      <button v-if="isUnixLike" type="button" data-commas @click="toggleDotFiles">
        <VisualIcon :name="isDotFilesVisible ? 'lucide-eye' : 'lucide-eye-closed'" />
      </button>
      <button type="button" data-commas @click="openNewTab">
        <VisualIcon name="lucide-terminal" />
      </button>
      <button v-if="externalExplorer" type="button" data-commas @click="openExternalExplorer">
        <VisualIcon name="lucide-square-arrow-out-up-right" />
      </button>
      <button type="button" data-commas @click="openDirectory">
        <VisualIcon :name="externalExplorer ? 'lucide-folder-open' : 'lucide-square-arrow-out-up-right'" />
      </button>
    </nav>
    <div ref="container" class="file-list">
      <a
        v-for="file in files"
        :key="file.name"
        href=""
        draggable="true"
        :class="['file', { directory: file.isDirectory }]"
        @click.prevent="selectFile($event, file)"
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
          <button
            v-if="file.symlink"
            type="button"
            data-commas
            class="file-action"
            @click.stop="showSymlink(file)"
          >
            <VisualIcon name="lucide-iteration-ccw" />
          </button>
          <button
            type="button"
            data-commas
            class="file-action"
            @click.stop="openExternal(file)"
          >
            <VisualIcon name="lucide-square-arrow-out-up-right" />
          </button>
        </span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';
@use '@commas/api/scss/_partials';

.action-line {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px #{8px - math.div(24px - 16px, 2)} 0;
  background: rgb(var(--theme-background) / var(--theme-opacity));
  .terminal-block.active:not(.standalone) & {
    top: 2px;
    padding-top: #{8px - 2px};
    padding-bottom: 2px;
  }
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
  color: inherit;
  text-decoration: none;
  border-radius: 4px;
  transition: transform 0.2s;
  &:hover {
    background: var(--design-highlight-background);
  }
  &:focus-visible {
    background: var(--design-highlight-background);
    outline: none;
  }
  &:active {
    transform: scale(partials.nano-scale(656));
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
}
.file-action {
  padding: 3px;
  font-size: 14px;
}
</style>
