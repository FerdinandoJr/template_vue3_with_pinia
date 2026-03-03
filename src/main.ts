import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './core/router'
import VueApexCharts from "vue3-apexcharts"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ptBr from 'element-plus/es/locale/lang/pt-br'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)

app.use(ElementPlus, {
    locale: ptBr,
})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')