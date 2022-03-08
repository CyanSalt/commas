import * as path from 'path'
import * as commas from 'commas:api/renderer'
import LandscapeAnchor from './landscape-anchor.vue'
import LandscapeSlot from './landscape-slot.vue'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.context.provide('@ui-slot', LandscapeSlot)

commas.context.provide('@ui-side-anchor', LandscapeAnchor)
