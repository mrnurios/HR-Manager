<script setup>
    import { computed, useAttrs } from 'vue';
    import { twMerge } from 'tailwind-merge';

    const attrs = useAttrs();
    // Merges your default classes with any custom classes passed to the component
    const mergedClasses = computed(() => 
    twMerge('bg-zinc-900/50 rounded-2xl border border-slate-200/15 shadow-2xl', attrs.class)
    );
</script>

<template>
    <div v-bind="{ ...attrs, class: mergedClasses }">
        <slot />
    </div>
</template>