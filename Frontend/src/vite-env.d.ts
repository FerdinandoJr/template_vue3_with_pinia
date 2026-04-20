/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue3-apexcharts' {
  import type { Plugin } from 'vue'
  const VueApexCharts: Plugin
  export default VueApexCharts
}