import * as commas from 'commas:api/renderer'
import LandscapeAnchor from './LandscapeAnchor.vue'
import LandscapeSlot from './LandscapeSlot.vue'

commas.ui.addCSSFile('dist/renderer/style.css')

commas.context.provide('@ui-slot', LandscapeSlot)

commas.context.provide('@ui-action-anchor', LandscapeAnchor)
