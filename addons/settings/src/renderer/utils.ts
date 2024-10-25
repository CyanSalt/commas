import type { Settings } from '@commas/types/settings'
import type { Component } from 'vue'

export interface SettingsItem {
  component: Component,
  key: keyof Settings,
}
