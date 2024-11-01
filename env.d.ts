/// <reference types="vite/client" />
/// <reference types="@vue-macros/reactivity-transform/macros-global" />

interface Element {
  scrollIntoViewIfNeeded(centerIfNeeded?: boolean): void,
}

declare namespace Intl {
  interface DurationFormat {
    format(value: any): string,
  }
  interface DurationFormatConstructor {
    new (locales?: string | string[], options?: any): DurationFormat,
    (locales?: string | string[], options?: any): DurationFormat,
    supportedLocalesOf(locales: string | string[], options?: any): string[],
    readonly prototype: DurationFormat,
  }
  const DurationFormat: DurationFormatConstructor
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
