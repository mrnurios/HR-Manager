<script setup>
    // 1. Declare the props explicitly
    defineProps({
        modelValue: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            required: true
        },
        isRequired: {
            type: Boolean,
            default: false
        } 
    })

    // 2. Declare the update event for v-model
    const emit = defineEmits(['update:modelValue'])
</script>


<template>
    <div class="relative w-fit">
        <select 
            v-bind="$attrs"
            :id="id"
            :required="isRequired"
            :value="modelValue"
            class="block form-input-style appearance-none pr-8  cursor-pointer"
            @change="$emit('update:modelValue', $event.target.value)"
        >
            <slot/>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    </div>
</template>