import * as commas from 'commas:api/renderer'
import PaintPane from './PaintPane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('paint', {
    title: 'Whiteboard#!paint.1',
    component: PaintPane,
  })

  commas.context.provide('terminal.shell', {
    label: 'Whiteboard#!paint.1',
    command: 'open-pane',
    args: ['paint'],
  })

}
