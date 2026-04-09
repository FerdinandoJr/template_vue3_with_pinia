import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import ptBr from 'element-plus/es/locale/lang/pt-br';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import VueApexCharts from 'vue3-apexcharts';
import App from './App.vue';
import router from './core/router';
import './assets/style.css';
import { permissionDirective } from './core/directives/permission';
import { safeHtmlDirective } from './core/directives/safeHtml';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(ElementPlus, {
    locale: ptBr,
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.use(VueApexCharts);
app.directive('permission', permissionDirective);
app.use(safeHtmlDirective);

app.mount('#app');