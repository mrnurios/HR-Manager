<script setup>
	import { computed } from 'vue'
	import { useRoute } from 'vue-router'

	const route = useRoute()

	// Appends /Add if the current path ends with /add
	const pageTitle = computed(() => {
		const isAddPage = route.name
		return isAddPage==='add-personnel' ? 'Add' : ''
	})
</script>

<template>
	<h1 class="opacity-60 text-3xl font-bold mb-8">
		<RouterLink
			:to="{ name: 'home-personnel' }" 
			class="hover:underline"
		>
			<span>Personnel</span>
		</RouterLink>
		/
		<span v-if="pageTitle !== 'home-personnel'" >{{ pageTitle }}</span>
	</h1>
	
	<RouterView />
</template>