<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute()

    // Appends /Add if the current path ends with /add
    const pageTitle = computed(() => {
      	const isAddPage = route.name
      	return isAddPage==='add-travelentry' ? 'Add' : ''
    })
</script>

<template>
  	<h1 class="opacity-60 text-3xl font-bold my-8">
		<RouterLink
			:to="{ name: 'home-travelentry' }" 
			class="hover:underline"
		>
			<span>Travel Entry</span>
		</RouterLink>
		/
		<span v-if="pageTitle !== 'home-travelentry'" >{{ pageTitle }}</span>
	</h1>

	<RouterView />
</template>