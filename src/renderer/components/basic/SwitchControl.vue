<script lang="ts" setup>
import { handleMousePressing } from '../../utils/helper'

let modelValue = $(defineModel<boolean>())

function change(event: Event) {
  modelValue = (event.target as HTMLInputElement).checked
}

let isDragged = false

function startDragging(startingEvent: DragEvent) {
  const initialValue = modelValue
  const bounds = (startingEvent.target as HTMLElement).getBoundingClientRect()
  const boundary = initialValue ? bounds.left : bounds.right
  handleMousePressing({
    onMove(event) {
      const targetValue = event.clientX > boundary
      modelValue = targetValue
    },
    onEnd(event) {
      if (modelValue !== initialValue) {
        isDragged = true
        // Not working here
        event.preventDefault()
      }
    },
  })
}

function guardClick(event: MouseEvent) {
  if (isDragged) {
    isDragged = false
    event.preventDefault()
  }
}
</script>

<template>
  <label class="switch-control" @click="guardClick">
    <input
      type="checkbox"
      :checked="modelValue"
      class="switch-checkbox"
      @change="change"
    >
    <span class="switch-track">
      <span
        class="switch-content"
        draggable="true"
        @dragstart.prevent="startDragging"
      ></span>
    </span>
  </label>
</template>

<style lang="scss" scoped>
.switch-control {
  position: relative;
  display: inline-flex;
}
.switch-checkbox {
  position: absolute;
  inset: 0;
  opacity: 0;
}
.switch-track {
  position: relative;
  display: inline-block;
  width: 2em;
  height: 1em;
  padding: 1px;
  cursor: pointer;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    display: inline-block;
    background: currentColor;
    border-radius: 0.5em;
    opacity: 0.25;
    transition: opacity 0.2s, background 0.2s;
    .switch-checkbox:checked + & {
      background: rgb(var(--system-accent));
      opacity: 1;
    }
    .switch-checkbox:checked:disabled + & {
      filter: grayscale(1);
    }
  }
  &:active::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgb(0 0 0 / 25%);
    border-radius: 1em;
  }
}
.switch-content {
  position: absolute;
  top: 1px;
  right: calc(1em + 1px);
  left: 1px;
  z-index: 1;
  display: inline-block;
  // width: 1em;
  height: 1em;
  background: white;
  border-radius: 1em;
  transition: left 0.2s, right 0.2s 40ms;
  .switch-checkbox:active + .switch-track > & {
    right: calc(0.75em + 1px);
  }
  .switch-checkbox:checked + .switch-track > & {
    right: 1px;
    left: calc(1em + 1px);
    transition: left 0.2s 40ms, right 0.2s;
  }
  .switch-checkbox:checked:active + .switch-track > & {
    left: calc(0.75em + 1px);
  }
  .switch-checkbox:focus-visible + .switch-track > & {
    background: rgb(255 255 255 / 75%);
  }
}
</style>
