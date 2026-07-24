<script setup>
    import { ref, watch, nextTick} from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute()
    const indicatorTop = ref(0)
    watch(() => route.path, async () => {
        await nextTick() // Ensures Vue has finished rendering the active class names
        
        // Directly grab the matching active element out of the current page document layout
        const activeLink = document.querySelector('.is-selected')
        if (activeLink) {
            // If your RouterLink is inside an <li>, grab the <li>'s offset instead
            const targetElement = activeLink.closest('li') || activeLink
            indicatorTop.value = targetElement.offsetTop
        }
    }, { immediate: true }) // Sets the initial loading track layout height instantly
</script>

<template>
    <aside class="text-slate-200 p-3">
        <div class="flex flex-col h-full">
            <!-- <span class="font-black my-15">MSWD</span> -->
            <nav class="relative nav-panel">
                <div 
                    id="nav-indicator"
                    class="z-0 absolute left-0 size-13 w-full bg-amber-200 rounded-2xl transition-all ease-in-out"
                    :style="{ transform: `translateY(${indicatorTop}px)` }"></div>
                <ul>
                    <li>
                        <RouterLink to="/" active-class="text-slate-800 is-selected" class="nav-router-option">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                            </svg>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/travel" active-class="text-slate-800 is-selected" class="nav-router-option" >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/personnel" active-class="text-slate-800 is-selected" class="nav-router-option">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                        </RouterLink>
                    </li>
                </ul>
            </nav>
            <div class="mt-auto space-y-2">
                <div class="size-13 border border-slate-200/20 shadow-md rounded-full ">
                    
                </div>
                <button type="button" class="hover:bg-red-400/40 size-13 flex items-center justify-center rounded-2xl cursor-pointer" >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                </button>
            </div>
        </div>
    </aside>
</template>
