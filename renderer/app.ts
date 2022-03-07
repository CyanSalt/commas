import { createApp } from 'vue'
import App from './components/app.vue'
import resources from './utils/resources'

createApp(App)
  .use(resources)
  .mount('#app')
