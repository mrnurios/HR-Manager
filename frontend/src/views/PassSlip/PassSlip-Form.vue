<template>
	<div class="relative space-y-5 py-4">
		<RouterLink 
			:to="{ name: 'home-passslip' }"
			class="hover:bg-zinc-900 p-2 inline-flex items-center rounded-lg border border-zinc-800">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
			</svg>

			<span class="ml-2">Back</span>
		</RouterLink>

		<Card class="p-8 rounded-4xl space-y-4 max-w-5xl mx-auto relative overflow-clip">
			<span class="font-bold text-2xl">{{ EditMode ? 'Edit Pass Slip' : 'Add Pass Slip' }}</span>
			<span class="block opacity-45 text-lg">{{ EditMode ? `Update pass slip entry ${serial_no}.`:'Add a new pass slip entry.'}}</span>
			
			<form @submit.prevent="EditMode ? updatePassSlipEntry() : createPassSlipEntry()" class="flex flex-col gap-3">
				<!-- <div>
					<label for="date_issued" class="font-bold text-sm opacity-45 ml-3">DATE ISSUED</label>
					<input
						id="date_issued"
						disabled
						:value="new Date().toISOString().split('T')[0]"
						type="date"
						required
						class="uppercase block form-input-style
								scheme-dark
								[&::-webkit-calendar-picker-indicator]:cursor-pointer
								[&::-webkit-calendar-picker-indicator]:opacity-80"
					/>
				</div> -->
				<div class="flex gap-3">
					<div>
						<label for="inclusive_date" class="font-bold text-sm opacity-45 ml-3">INCLUSIVE DATE</label>
						<input
							:disabled="isSubmitting"
							id="inclusive_date"
							v-model="passSlip.inclusive_date"
							type="date"
							required
							class="uppercase block form-input-style
									scheme-dark
									[&::-webkit-calendar-picker-indicator]:cursor-pointer
									[&::-webkit-calendar-picker-indicator]:opacity-80"
						/>
					</div>
					<div>
						<label for="personnel" class="font-bold text-sm opacity-45 ml-3">PERSONNEL</label>
						<FormSelect :disabled="isSubmitting" id="personnel" v-model="passSlip.personnel_uuid" :is-required=true class="uppercase w-72">
							<option value="" disabled selected>Select Personnel</option>
							<option v-for="b in personnelStore.allPersonnel" :key="b.personnel_uuid" :value="b.personnel_uuid">
								{{ b.last_name }}, {{ b.first_name }}
							</option>
						</FormSelect>
					</div>
					<div class="relative">
						<label for="time_departure" class="font-bold text-sm opacity-45 ml-3">DEPARTURE TIME</label>
						<input
							:disabled="isSubmitting"
							id="time_departure"
							v-model="passSlip.time_departure" 
							type="time"
							required
							:class="{ 'pr-6' : passSlip.time_departure}"
							class="uppercase block form-input-style
									scheme-dark
									[&::-webkit-calendar-picker-indicator]:cursor-pointer
									[&::-webkit-calendar-picker-indicator]:opacity-80"
						/>
						<button
							:disabled="isSubmitting"
							v-if="passSlip.time_departure"
							type="button"
							@click="passSlip.time_departure = ''"
							class="absolute right-2 top-1/2 text-red-300 cursor-pointer"
						>
							✕
						</button>
					</div>
					<div class="relative">
						<label for="time_arrival" class="font-bold text-sm opacity-45 ml-3">ARRIVAL TIME</label>
						<input
							:disabled="isSubmitting"
							id="time_arrival"
							v-model="passSlip.time_arrival"
							:class="{ 'pr-6' : passSlip.time_arrival}"
							type="time"
							class="uppercase block form-input-style
									scheme-dark
									[&::-webkit-calendar-picker-indicator]:cursor-pointer
									[&::-webkit-calendar-picker-indicator]:opacity-80"
						/>
						<button
							:disabled="isSubmitting"
							v-if="passSlip.time_arrival"
							type="button"
							@click="passSlip.time_arrival = ''"
							class="absolute right-2 top-1/2 text-red-300 cursor-pointer"
						>
							✕
						</button>
					</div>
				</div>
				<div>
					<label for="destination" class="font-bold text-sm opacity-45 ml-3">DESTINATION</label>
					<input
						:disabled="isSubmitting"
						id="destination"
						placeholder="Location..."
						v-model="passSlip.destination" 
						type="text"
						required
						class="block w-full form-input-style
								scheme-dark
								[&::-webkit-calendar-picker-indicator]:cursor-pointer
								[&::-webkit-calendar-picker-indicator]:opacity-80"
					/>
				</div>
				<div>
					<label for="purpose" class="font-bold text-sm opacity-45 ml-3">PURPOSE</label>
					<input
						:disabled="isSubmitting"
						id="purpose"
						placeholder="Purpose..."
						v-model="passSlip.purpose" 
						type="text"
						required
						class="block w-full form-input-style
								scheme-dark
								[&::-webkit-calendar-picker-indicator]:cursor-pointer
								[&::-webkit-calendar-picker-indicator]:opacity-80"
					/>
				</div>
				<div class="ml-auto gap-3 flex">
					<button v-if="EditMode" 
						:disabled="isSubmitting"
						type="button"
						@click="router.push({name: 'home-passslip'})"
						class="disabled:opacity-50 enabled:active:scale-95 w-40 h-15 bg-zinc-800 border border-slate-200/15 enabled:hover:bg-zinc-400/50 rounded-2xl enabled:cursor-pointer">
						Cancel
					</button>
					<button :disabled="(Object.keys(dirtyFields).length === 0 && EditMode) || isSubmitting" type="submit" class="disabled:opacity-50 enabled:active:scale-95 w-40 h-15 bg-zinc-800 border border-slate-200/15 enabled:hover:bg-zinc-400/50 rounded-2xl enabled:cursor-pointer">{{ EditMode ? 'Save Update' : 'Submit' }}</button>
				</div>
			</form>

			<div v-if="showfeedback" class="absolute inset-0 w-full h-full backdrop-blur-md bg-zinc-900/10 flex items-center">
				<MsgBox class="bg-zinc-900 mx-auto h-50" @click="handleParentAction" >
					<div class="flex flex-col items-center h-full justify-center">
						<div v-if="serial_no" class="flex flex-col items-center">
							<span class="">Serial No.</span>
							<span class="text-4xl font-bold underline">{{ serial_no }}</span>
						</div>
						<span v-else class="whitespace-pre-line text-center">{{ feedbackmsg }}</span>
					</div>
				</MsgBox>
			</div>
		</Card>
	</div>
</template>

<script setup>
	import { ref,computed,onMounted } from 'vue'
	import { useRoute,useRouter } from 'vue-router'
  	import FormSelect from '../../components/FormDropdown.vue'
  	import Card from '../../components/Card.vue'
  	import MsgBox from '../../components/CustomMsgBox.vue'
	import * as API from '../../services/api.js'
	import * as store from '../../stores/stores.js'
	import * as tools from '../../utils/format.js'
	
	const passSlipStore = store.usePassSlipStore()
	const personnelStore = store.usePersonnelStore()
	const route = useRoute()
	const router = useRouter()
	const EditMode = ref(false)
	const isSubmitting = ref(false)
	const createPassSlipEntry = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true

		try {
			serial_no.value = ''

			const response = await API.createnewPassSlip(passSlip.value)
			if (response.success){
				const year = new Date(response.row.date_issued.split('T')[0]).getFullYear();
				const no = response.row.pass_no.toString().padStart(4, "0");
				serial_no.value = `${year}-${no}`
				feedbackmsg.value =`Pass Slip Entry Created Successfully!`;

				clearFields();
			}else{
				feedbackmsg.value = 'Error! Failed creating Pass Slip entry!'
			}
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = `Error! Failed creating Pass Slip entry!\n${error.message}`
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}
	const ErrorOccured = ref(false);
	const updatePassSlipEntry = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true
		ErrorOccured.value = false;
		try {
			serial_no.value = ''

			const response = await API.patchPassSlip(passSlipStore.selectedPassSlipEntry.id,JSON.parse(JSON.stringify(dirtyFields)))
			if (response.success){
				feedbackmsg.value =`Pass slip entry updated successfully!`;
			}else{
				feedbackmsg.value = 'Error! Failed updating pass slip entry!'
			}
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = `Error! Failed updating pass slip entry!\n${error.message}`
			ErrorOccured.value = true;
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}

	const serial_no = ref('')

	const originalpassSlip = ref(null)
	const passSlip = ref({
		inclusive_date: new Date().toISOString().split('T')[0],
		personnel_uuid: '',
		purpose: '',
		destination: '',
		time_departure: '',
		time_arrival: ''
	})

	function clearFields() {
		passSlip.value = {
			inclusive_date: new Date().toISOString().split('T')[0],
			personnel_uuid: '',
			purpose: '',
			destination: '',
			time_departure: '',
			time_arrival: ''
		}
	};

	const serialize = (number,date) => {
		return `${new Date(date).getFullYear()}-${number.toString().padStart(4,"0")}`
	}

	const dirtyFields = tools.dirtyFields(passSlip,originalpassSlip)

	function localDateString(datestr){
		const dateObj = new Date(datestr);
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
		const day = String(dateObj.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	onMounted(async () => {
		EditMode.value = (route.name === 'edit-passslip')
		if (EditMode.value){
			if (!passSlipStore.selectedPassSlipEntry) {
				router.push({
					name: 'home-passslip'
				})
			}else{
				passSlip.value = {
					inclusive_date: localDateString(passSlipStore.selectedPassSlipEntry.inclusive_date),
					personnel_uuid: passSlipStore.selectedPassSlipEntry.personnel_uuid,
					purpose: passSlipStore.selectedPassSlipEntry.purpose,
					destination: passSlipStore.selectedPassSlipEntry.destination,
					time_departure: passSlipStore.selectedPassSlipEntry.time_departure,
					time_arrival: passSlipStore.selectedPassSlipEntry.time_arrival
				}
				serial_no.value = serialize(passSlipStore.selectedPassSlipEntry.pass_no,passSlipStore.selectedPassSlipEntry.date_issued)
			}
			originalpassSlip.value = {...passSlip.value}
		}

		console.log()
		
		if (personnelStore.allPersonnel.length === 0) {
			await personnelStore.populatePersonnel()
		}
    });

	const feedbackmsg = ref('Pass Slip Entry Created Successfully!')
	const handleParentAction = () => {
		showfeedback.value = false
		if(!ErrorOccured.value){
			router.push({name: 'home-passslip'})
		}
	};
	const showfeedback = ref(false)
</script>