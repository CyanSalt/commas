// import type * as lucide from 'lucide-static'
// import type { KebabCase } from 'type-fest'

// TODO: too deep
// export type LucideIcon = keyof {
//   [K in keyof typeof lucide as `lucide-${KebabCase<K>}`]: unknown
// }
export type LucideIcon = `lucide-${string}`

export type SimpleIconsIcon = `simple-icons-${string}`
