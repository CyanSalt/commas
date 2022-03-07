import * as path from 'path'
import * as commas from 'commas:api/renderer'
import CleanerLink from './cleaner-link.vue'

commas.workspace.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.context.provide('preference', {
  component: CleanerLink,
  group: 'about',
})
