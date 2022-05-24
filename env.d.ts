/// <reference types="vue/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*?worker' {
  const script: {
    new(): Worker,
  }
  export default script
}

declare module 'commas:api/main' {
  export * from '@commas/api/main'
}

declare module 'commas:api/renderer' {
  export * from '@commas/api/renderer'
}
