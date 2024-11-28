<script lang="ts" setup>
import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import { MenuItem } from '@commas/types/menu'
import * as commas from 'commas:api/renderer'
import { nextTick, watch, watchEffect } from 'vue'
import { FileEntity } from '../types/file'
import { useIsDotFileVisible } from './compositions'

const { VisualIcon } = commas.ui.vueAssets

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

let isDotFilesVisible = $(useIsDotFileVisible())

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

function openContextMenu(event: MouseEvent, file?: FileEntity) {
  commas.ui.openContextMenu([
    ...(isUnixLike ? [
      {
        label: 'Show All Files#!explorer.2',
        type: 'checkbox',
        checked: isDotFilesVisible,
        command: 'show-all-files',
        args: [!isDotFilesVisible],
      },
    ] satisfies MenuItem[] : []),
    {
      label: 'Open in System#!explorer.4',
      command: !file || file.isDirectory ? 'global-main:open-path' : 'global-main:show-file',
      args: [file ? file.path : modelValue],
    },
  ], event)
}
</script>

<template>
  <div class="file-explorer" @contextmenu="openContextMenu">
    <nav data-commas class="action-line">
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
      <button type="button" data-commas @click="openNewTab">
        <VisualIcon name="lucide-terminal" />
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
        @contextmenu.stop="openContextMenu($event, file)"
      >
        <VisualIcon
          :name="file.symlink
            ? (file.isDirectory ? 'lucide-folder-symlink' : 'lucide-file-symlink')
            : (file.isDirectory ? 'lucide-folder' : 'lucide-file')"
          class="file-icon"
        />
        <span class="file-name">{{ file.name }}{{ file.isDirectory ? path.sep : '' }}</span>
        <button
          v-if="file.symlink"
          type="button"
          data-commas
          class="file-action"
          @click.prevent.stop="showSymlink(file)"
        >
          <VisualIcon name="lucide-iteration-ccw" />
        </button>
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
  gap: 2px;
  margin-top: 4px;
}
.file {
  display: flex;
  gap: 4px;
  align-items: center;
  height: #{14px + 3px * 2};
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
.file-action {
  padding: 3px;
  .file:not(:hover) & {
    visibility: hidden;
  }
}
</style>
