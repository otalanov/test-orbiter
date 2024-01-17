import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueDayjs from 'vue3-dayjs-plugin'

const app = createApp(App)

app.use(router)
app.use(VueDayjs)

app.mount('#app')
