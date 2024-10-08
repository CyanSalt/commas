<script lang="ts" setup>
import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import { watch, watchEffect } from 'vue'
import { FileEntity } from '../types/file'

const { VisualIcon } = commas.ui.vueAssets

let modelValue = $(defineModel<string>({ default: '' }))

let entities = $ref<FileEntity[]>([])

watchEffect(async () => {
  entities = await ipcRenderer.invoke('read-directory', modelValue)
})

const isRoot = $computed(() => {
  return path.dirname(modelValue) === modelValue
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
  if (!isRoot) {
    result = [
      {
        name: '..',
        path: path.dirname(modelValue),
        isDirectory: true,
        isSymlink: false,
      },
      ...result,
    ]
  }
  return result
})

function selectFile(file: FileEntity) {
  if (file.isDirectory) {
    modelValue = file.path
  } else {
    commas.context.invoke('global-renderer:open-file', file.path)
  }
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

async function showFile(file: FileEntity) {
  const originalPath = await ipcRenderer.invoke('read-symlink', file.path)
  modelValue = path.dirname(originalPath)
}

function openExternal(file: FileEntity) {
  if (file.isDirectory) {
    ipcRenderer.invoke('open-path', file.path)
  } else {
    ipcRenderer.invoke('show-file', file.path)
  }
}

function openExternalDirectory() {
  ipcRenderer.invoke('open-path', modelValue)
}

function startDragging(event: DragEvent, file: FileEntity) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', file.path)
  }
  ipcRenderer.invoke('drag-file', file.path)
}
</script>

<template>
  <div class="file-explorer">
    <div class="form-line action-line">
      <slot></slot>
      <span :class="['link', 'form-action', { disabled: !hasPreviousValue }]" @click="goBack">
        <VisualIcon name="lucide-undo-2" />
      </span>
      <span v-if="isUnixLike" class="link form-action" @click="toggleDotFiles">
        <VisualIcon :name="isDotFilesVisible ? 'lucide-eye' : 'lucide-eye-closed'" />
      </span>
      <span class="link form-action" @click="openExternalDirectory">
        <VisualIcon name="lucide-external-link" />
      </span>
    </div>
    <div class="file-list">
      <a
        v-for="file in files"
        :key="file.name"
        draggable="true"
        :class="['file', { directory: file.isDirectory }]"
        @click="selectFile(file)"
        @dragstart.prevent="startDragging($event, file)"
      >
        <VisualIcon
          :name="file.isSymlink
            ? (file.isDirectory ? 'lucide-folder-symlink' : 'lucide-file-symlink')
            : (file.isDirectory ? 'lucide-folder' : 'lucide-file')"
          class="file-icon"
        />
        <span class="file-name">{{ file.name }}{{ file.isDirectory ? path.sep : '' }}</span>
        <span class="action-list">
          <span
            v-if="file.isSymlink"
            class="link form-action"
            @click.stop="showFile(file)"
          >
            <VisualIcon name="lucide-iteration-ccw" />
          </span>
          <span
            class="link form-action"
            @click.stop="openExternal(file)"
          >
            <VisualIcon name="lucide-external-link" />
          </span>
        </span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';

.action-line {
  padding: 0 #{8px - math.div(24px - 16px, 2)};
}
.file-list {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
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
    .file-icon,
    .file-name {
      color: rgb(var(--theme-blue));
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
</style>
