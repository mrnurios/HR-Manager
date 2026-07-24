import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/personnel',
        name: 'personnel',
        component: () => import('../views/Personnel.vue'),
        children:[
            { 
                path: '',
                name: 'home-personnel',
                component: () => import('../views/Personnel-Home.vue')
            },
            {
                path: 'add',
                name: 'add-personnel',
                component: () => import('../components/Personnel-Form.vue')
            }
        ]
    },
    {
        path: '/travel',
        name: 'travel-entries',
        component: () => import('../views/TravelEntries.vue'),
        children:[
            { 
                path: '',
                name: 'home-travelentry',
                component: () => import('../views/TravelEntries-Home.vue')
            },
            { 
                path: 'add',
                name: 'add-travelentry',
                component: () => import('../components/TravelEntries-Form.vue')
            }
        ]
    },
    {
        path: '/cases',
        name: 'cases',
        component: () => import('../views/Cases.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
