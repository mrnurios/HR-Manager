import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import AOS from 'aos'
import 'aos/dist/aos.css'

AOS.init({
    container: '#table-scroll-container', 
    duration: 200,     // Animation speed duration in ms
    once: true,        // Decide if animation should happen only once
    easing: 'ease-out' // Default easing structure style selection
})

const app = createApp(App)
app.use(router)
app.mount('#app')