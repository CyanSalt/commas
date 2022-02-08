/// <reference types="vue/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'commas:api/main' {
  export * from 'api/main'
}

declare module 'commas:api/renderer' {
  export * from 'api/renderer'
}
