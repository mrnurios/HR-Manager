<template>
    <aside class="text-slate-200">
        <div class="flex flex-col h-full p-2">
            <!-- <span class="font-black my-15">MSWD</span> -->
            
            <!-- REMOVED: Extra nav layer styling to align container boxes perfectly -->
            <nav class="relative">
                <div v-if="showindicator"
                    id="nav-indicator"
                    class="z-0 absolute size-9 bg-amber-200 rounded-lg transition-all duration-200 ease-in-out"
                    :style="{ transform: `translateY(${indicatorTop}px)` }">
                </div>
                
                <ul class="relative flex flex-col items-center gap-y-2">
                    <li
                        v-for="option in navOptions" 
                        :key="option.to"
                        ref="itemRefs"
                        class="relative z-10 size-9 flex items-center justify-center"
                    >
                        <!-- RouterLink handles only color changes and styling states now -->
                        <RouterLink 
                            :to="option.to" 
                            active-class="text-slate-800 is-selected" 
                            class="text-slate-400 size-full hover:bg-zinc-700/50 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <!-- Dynamically render the component icon -->
                            <component :is="option.icon" class="size-6" stroke-width="1.5" />
                        </RouterLink>
                    </li>
                </ul>
            </nav>
            
            <!-- <div class="mt-auto space-y-2 items-center flex flex-col">
                <div class="size-9 border border-slate-200/20 shadow-md rounded-full">
                    
                </div>
                <button type="button" class="hover:bg-red-400/40 size-9 flex items-center justify-center rounded-lg cursor-pointer" >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                </button>
            </div> -->
        </div>
    </aside>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted, nextTick } from 'vue'
    import { useRoute } from 'vue-router'
    import { 
        Squares2X2Icon, 
        MapPinIcon, 
        TicketIcon, 
        UsersIcon,
        BuildingOffice2Icon 
    } from '@heroicons/vue/24/outline';

    interface NavOption {
        to: string;
        name: string;
        icon: typeof Squares2X2Icon; 
    }

    const navOptions: NavOption[] = [
        { to: '/dashboard', name:'home', icon: Squares2X2Icon },         
        { to: '/travel', name:'travel entries', icon: MapPinIcon },       
        { to: '/pass-slip', name:'pass slips', icon: TicketIcon },    
        { to: '/personnel', name:'personnel', icon: UsersIcon },      
        { to: '/departments', name:'departments', icon: BuildingOffice2Icon }      
    ];

    const route = useRoute()
    const indicatorTop = ref<number>(0);
    
    // FIX 1: Since ref="itemRefs" is on an <li> tag now, it is a plain HTMLElement array
    const itemRefs = ref<HTMLElement[]>([]);
    const showindicator = ref(false)

    watch(() => route.name, async (newName) => {
        await nextTick();
        if (route.matched.length === 0) return;
        const activeIndex = navOptions.findIndex(option => option.to === route.matched[0].path);
        
        if (activeIndex !== -1 && itemRefs.value[activeIndex]) {
            // FIX 2: Read offsetTop directly from the <li> element. 
            // This will accurately print 0, 44, 88, 132 as you swap routes!
            const targetEl = itemRefs.value[activeIndex];
            // console.log("Calculated Layout Offset:", targetEl.offsetTop);
            
            indicatorTop.value = targetEl.offsetTop; 
            showindicator.value = true;
        }
    }, { immediate: true })

    // onMounted(() => {
    //     updateIndicatorPosition();
    // });
</script>
