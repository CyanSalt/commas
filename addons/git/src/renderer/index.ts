import * as commas from 'commas:api/renderer'
import GitAnchor from './GitAnchor.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.context.provide('terminal.ui-title-anchor', GitAnchor)

}
