import type { Component } from 'vue'

declare module './modules/context' {
  export interface Context {
    '@ui-action-anchor': Component,
    '@ui-side-list': Component,
    '@ui-slot': Component,
  }
}

export * as app from './modules/app'
export * as context from './modules/context'
export * as helper from './modules/helper'
export * as ipcRenderer from './modules/ipc-renderer'
export * as remote from './modules/remote'
export * as ui from './modules/ui'
export * as workspace from './modules/workspace'
