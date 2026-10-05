<template>
    <Card v-bind="{ ...attrs, class: mergedClasses }" class="flex flex-col justify-center items-center">
        <div class="flex-1">
            <slot />
        </div>
        <button 
            type="button"
            @click="$emit('click')"
            class="hover:bg-zinc-950 bg-zinc-950/50 p-4 inline-flex items-center shadow-md justify-center rounded-xl border w-full border-zinc-800 cursor-pointer">
            {{ buttondescription }}
        </button>
    </Card>
</template>

<script setup>
    import Card from '../components/Card.vue'
    import { computed, useAttrs } from 'vue';
    import { twMerge } from 'tailwind-merge';

    const attrs = useAttrs();
    // Merges your default classes with any custom classes passed to the component
    const mergedClasses = computed(() => 
        twMerge('bg-zinc-900/50 rounded-2xl border border-slate-200/15 shadow-2xl w-96 h-60 p-3', attrs.class)
    );

    defineProps({
        buttondescription: {
            type: String,
            default: 'OK'
        }
    });

    defineEmits(['click']);
</script>
