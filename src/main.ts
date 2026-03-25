import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import ptBr from 'element-plus/es/locale/lang/pt-br';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// Importação do ApexCharts
import VueApexCharts from 'vue3-apexcharts';

import App from './App.vue';
import router from './core/router';
import './assets/style.css';
import { permissionDirective } from './core/directives/permission';

const app = createApp(App);

// Configurando o Pinia com o plugin de persistência
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

// Configuração Global Element Plus com idioma Pt-Br
app.use(ElementPlus, {
    locale: ptBr,
});

// Registrando Ícones do Element Plus Globalmente
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// Registrando o ApexCharts Globalmente
app.use(VueApexCharts);

// Diretiva de Permissão Global
app.directive('permission', permissionDirective);

app.mount('#app');