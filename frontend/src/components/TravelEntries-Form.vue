<script setup>
	import { ref,computed } from 'vue'
  	import FormSelect from '../components/FormDropdown.vue'
  	import Card from '../components/Card.vue'
  	import MsgBox from '../components/MsgBox.vue'
	import api from '../services/api'

	const isSubmitting = ref(false)
	const createTravel = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true

		try {
			// No need to pass full URL or wrap payload in JSON.stringify
			const response = await api.post('/travelentry/add', profile.value)
			if (response.data.success){
				clearProfile();
				feedbackmsg.value ='Travel Entry Created Successfully!';
			}else{
				feedbackmsg.value = 'Error! Failed Creating Travel Entry!'
			}
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = 'Error! Failed Creating Travel Entry!'
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}

	const feedbackmsg = ref('Travel Entry Created Successfully!')
	const handleParentAction = () => showfeedback.value = false;
	const showfeedback = ref(false)
</script>

<template>
	<div class="relative space-y-5">
		<RouterLink 
			:to="{ name: 'home-travelentry' }"
			class="hover:bg-zinc-900 p-4 inline-flex items-center rounded-xl border border-zinc-800">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
			</svg>

			<span class="ml-2">Back</span>
		</RouterLink>

		<Card class="p-8 rounded-4xl space-y-4 max-w-5xl mx-auto relative overflow-clip">
			<span class="font-bold text-2xl">Add Entry</span>
			<span class="block opacity-45 text-lg">Add a new travel entry.</span>
			
			<div v-if="showfeedback" class="absolute inset-0 w-full h-full backdrop-blur-md bg-zinc-900/10 flex items-center">
				<MsgBox class="bg-zinc-900 mx-auto h-50" :message="feedbackmsg" @click="handleParentAction" />
			</div>
		</Card>
	</div>
</template>