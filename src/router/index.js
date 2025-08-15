import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RadarChart from '@/views/RadarChart.vue'
import NitrogenUtilizationRadar from '@/views/NitrogenUtilizationRadar.vue'
import NitrogenTimeSeriesRadar from '@/views/NitrogenTimeSeriesRadar.vue'
import NitrogenInteractiveRadar from '@/views/NitrogenInteractiveRadar.vue'
import IntegratedRadarDashboard from '@/views/IntegratedRadarDashboard.vue'
import GrowthStageRadar from '@/views/GrowthStageRadar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    { 
      path: '/radar', 
      name: 'radar',
      component: RadarChart 
    },
    {
      path: '/nitrogen-utilization',
      name: 'nitrogen-utilization',
      component: NitrogenUtilizationRadar
    },
    {
      path: '/nitrogen-timeseries',
      name: 'nitrogen-timeseries',
      component: NitrogenTimeSeriesRadar
    },
    {
      path: '/nitrogen-interactive',
      name: 'nitrogen-interactive',
      component: NitrogenInteractiveRadar
    },
    {
      path: '/integrated-dashboard',
      name: 'integrated-dashboard',
      component: IntegratedRadarDashboard
    },
    {
      path: '/growth-stage-radar',
      name: 'growth-stage-radar',
      component: GrowthStageRadar
    }
  ],
})

export default router
