import * as commas from 'commas:api/renderer'
import CameraAnchor from './CameraAnchor.vue'

export default () => {

  commas.context.provide('terminal.ui-right-action-anchor', CameraAnchor)

}
