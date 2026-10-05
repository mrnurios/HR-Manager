<template>
    <header class="text-slate-200 h-12 w-full flex items-center px-2 gap-1">
        <!-- <div class="flex w-full items-center h-full"> -->
        <RouterLink to="/" class="flex items-center gap-2">
            <HomeIcon class="size-6 text-zinc-500" />
            <span class="text-zinc-500 font-black text-2xl">HRMO</span>

        </RouterLink>
        <nav>
            <ul class="flex items-center gap-1 text-zinc-500">
                <li v-for="(option,index) in navOptions"
                    class="z-10 size-9 flex items-center w-full gap-1 after:content-['/']"
                >
                    <RouterLink v-if="index === 0" :to="option.toPath" class="whitespace-nowrap rounded-lg px-2">
                        {{ option.label }}
                    </RouterLink>

                    <span v-else class="whitespace-nowrap px-2">
                        {{ option.label.split(' ')[0] }}
                    </span>
                </li>
            </ul>
        </nav>

        <!-- </div> -->
    </header>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted, nextTick } from 'vue'
    import { useRoute,useRouter } from 'vue-router'
    import { HomeIcon } from '@heroicons/vue/24/solid';

    interface NavOption {
        label: string
        toName: string
        toPath: string
    }

    const navOptions = ref<NavOption[]>([])

    const route = useRoute()
    const router = useRouter()
    // const indicatorTop = ref<number>(0);
    
    // // FIX 1: Since ref="itemRefs" is on an <li> tag now, it is a plain HTMLElement array
    // const itemRefs = ref<HTMLElement[]>([]);

    watch(() => route.path, async () => {
        const routes = route.matched
            .filter(record => record.name)
            .map(record => {
                const routeName = record.name as string 
                
                return {
                    // Clean up the name for the UI label (e.g., 'travel-entries' becomes 'Travel Entries')
                    label: routeName.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()), 
                    toName: routeName,
                    toPath: record.path
                }
            })
        const uniqueRoutes = routes.filter((item, index, self) => 
            self.findIndex(t => t.toPath === item.toPath) === index
        )
        navOptions.value = [...uniqueRoutes]
    }, { immediate: true })

    // onMounted(() => {
    //     updateIndicatorPosition();
    // });
</script>
