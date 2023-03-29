/// <reference types="vue/macros-global" />

interface Element {
  scrollIntoViewIfNeeded(centerIfNeeded?: boolean): void,
}

declare module '@achrinza/node-ipc' {
  export { default } from 'node-ipc'
}

declare module 'commas:api/main' {
  export * from '@commas/api/main'
}

declare module 'commas:api/renderer' {
  export * from '@commas/api/renderer'
}
