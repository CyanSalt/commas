import * as path from 'path'
import * as commas from 'commas:api/renderer'
import GitAnchor from './GitAnchor.vue'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.context.provide('@ui-action-anchor', GitAnchor)
