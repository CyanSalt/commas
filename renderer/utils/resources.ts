import LoadingSpinner from '../components/basic/loading-spinner.vue'
import ObjectEditor from '../components/basic/object-editor.vue'
import SortableList from '../components/basic/sortable-list.vue'
import SwitchControl from '../components/basic/switch-control.vue'
import TerminalPane from '../components/basic/terminal-pane.vue'
import ValueSelector from '../components/basic/value-selector.vue'
import TabItem from '../components/tab-item.vue'
import { vI18n } from './i18n'

export default {
  install(app) {
    app
      .directive('i18n', vI18n)
      .component('LoadingSpinner', LoadingSpinner)
      .component('ObjectEditor', ObjectEditor)
      .component('SortableList', SortableList)
      .component('SwitchControl', SwitchControl)
      .component('TerminalPane', TerminalPane)
      .component('ValueSelector', ValueSelector)
      .component('TabItem', TabItem)
  },
}
