import './internal/connect'
import { createApp } from 'vue'
import App from './components/app.vue'
import { translateElement } from './utils/i18n'

createApp(App)
  .directive('i18n', translateElement)
  .mount('#app')
