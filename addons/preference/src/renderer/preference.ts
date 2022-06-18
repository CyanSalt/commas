import type { Component } from 'vue'

export interface PreferenceItem {
  component: Component,
  group: 'general' | 'feature' | 'customization' | 'about',
  priority?: number,
}
