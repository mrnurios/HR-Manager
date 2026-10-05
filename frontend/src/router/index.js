import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/dashboard',
        name: 'home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/',
        redirect: '/dashboard' 
    },
    {
        path: '/personnel',
        name: 'personnel',
        component: () => import('../views/Personnel/Personnel.vue'),
        children:[
            {
                path: '',
                name: 'home-personnel',
                component: () => import('../views/Personnel/Personnel-Home.vue')
            },
            {
                path: 'add',
                name: 'add-personnel',
                component: () => import('../views/Personnel/Personnel-Form.vue')
            },
            {
                path: ':id',
                name: 'view-personnel',
                component: () => import('../views/Personnel/Personnel-Profile.vue')
            },
            {
                path: ':id/edit',
                name: 'edit-personnel',
                component: () => import('../views/Personnel/Personnel-Form.vue')
            }
        ]
    },
    {
        path: '/travel',
        name: 'travel entries',
        component: () => import('../views/TravelEntries/TravelEntries.vue'),
        children:[
            {
                path: '',
                name: 'home-travelentry',
                title: 'Travel Entries',
                component: () => import('../views/TravelEntries/TravelEntries-Home.vue'),
            },
            {
                path: 'add',
                title: 'Add',
                name: 'add-travelentry',
                component: () => import('../views/TravelEntries/TravelEntries-Form.vue')
            },
            {
                path: 'edit',
                title: 'Edit',
                name: 'edit-travelentry',
                component: () => import('../views/TravelEntries/TravelEntries-Form.vue')
            }
        ]
    },
    {
        path: '/pass-slip',
        name: 'pass slips',
        component: () => import('../views/PassSlip/PassSlip.vue'),
        children:[
            {
                path: '',
                name: 'home-passslip',
                component: () => import('../views/PassSlip/PassSlip-Home.vue')
            },
            {
                path: 'add',
                name: 'add-passslip',
                component: () => import('../views/PassSlip/PassSlip-Form.vue')
            },
            {
                path: 'edit',
                name: 'edit-passslip',
                component: () => import('../views/PassSlip/PassSlip-Form.vue')
            }
        ]
    },
    {
        path: '/departments',
        name: 'departments',
        component: () => import('../views/Departments/Departments-Home.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
