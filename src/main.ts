import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './core/router'
import VueApexCharts from "vue3-apexcharts";
import { setupTicketsDI } from './modules/tickets/di';
import { setupSettingsDI } from './modules/settings/di';
import { setupClientsDI } from './modules/clients/di';
import { setupDashboardDI } from './modules/dashboard/di';
import { setupCalendarDI } from './modules/calendar/di';
import { setupChatsDI } from './modules/chats/di';
import { setupKanbanDI } from './modules/kanban/di';
import { setupKbDI } from './modules/kb/di';
import { setupReportsDI } from './modules/reports/di';
import { setupServiceDI } from './modules/service/di';

const app = createApp(App)

setupTicketsDI(app);
setupSettingsDI(app);
setupClientsDI(app);
setupDashboardDI(app);
setupCalendarDI(app);
setupChatsDI(app);
setupKanbanDI(app);
setupKbDI(app);
setupReportsDI(app);
setupServiceDI(app);

app.use(createPinia())
app.use(router)
app.use(VueApexCharts);

app.mount('#app')