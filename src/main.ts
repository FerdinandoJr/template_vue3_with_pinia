import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './core/router'
import VueApexCharts from "vue3-apexcharts";
import { setupTicketsDI } from './modules/tickets/di';
import { setupSettingsDI } from './modules/settings/di';
import { setupClientsDI } from './modules/clients/di';

const app = createApp(App)

setupTicketsDI(app);
setupSettingsDI(app);
setupClientsDI(app);

app.use(createPinia())
app.use(router)
app.use(VueApexCharts);

app.mount('#app')