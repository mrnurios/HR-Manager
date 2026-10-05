<template>
	<div class="space-y-2 py-4">
		<button 
			@click="router.back()"
			class="hover:bg-zinc-900 p-2 inline-flex items-center rounded-lg border border-zinc-800 w-fit">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
			</svg>

			<span class="ml-2">Back</span>
		</button>

		<div>
			<span class="font-bold text-2xl">{{ EditMode ? 'Edit Travel Entry' : 'Add Travel Entry' }}</span>
			<span class="block opacity-45 text-md">{{ EditMode ? `Update travel entry ${serial_no}.`:'Add a new travel entry.'}}</span>
		</div>
			
		<Card class="p-6 rounded-lg shrink min-w-0 w-4xl space-y-4 mx-auto relative overflow-clip">
			<form @submit.prevent="EditMode ? updateTravelEntry() : createTravelEntry()" class="flex flex-col gap-3">
				<div class="flex gap-3">
					<div>
						<label for="personnel" class="font-bold text-sm opacity-45 ml-3">PERSONNEL</label>
						<FormSelect :disabled="isSubmitting" id="personnel" v-model="travel.personnel_uuid" :is-required=true class="uppercase w-72">
							<option value="" disabled selected>Select Personnel</option>
							<option v-for="b in personnelStore.allPersonnel" :key="b.personnel_uuid" :value="b.personnel_uuid">
								{{ b.last_name }}, {{ b.first_name }}
							</option>
						</FormSelect>
					</div>
					<div>
						<label for="personnel" class="font-bold text-sm opacity-45 ml-3">DEPARTMENT</label>
						<FormSelect :disabled="isSubmitting" id="personnel" v-model="travel.department" :is-required=true class="capitalize w-72">
							<option value="" disabled selected>Select Department</option>
							<option v-for="d in personnelStore.allDepartments" :key="d.dep_id" :value="d.dep_id">
								{{ d.dep_code }} - {{ d.dep_name }}
							</option>
						</FormSelect>
					</div>
				</div>
				<div>
					<label for="destination" class="font-bold text-sm opacity-45 ml-3">DESTINATION</label>
					<input
						:disabled="isSubmitting"
						id="destination"
						placeholder="Location..."
						v-model="travel.whereto" 
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
						v-model="travel.purpose" 
						type="text"
						required
						class="block w-full form-input-style
								scheme-dark
								[&::-webkit-calendar-picker-indicator]:cursor-pointer
								[&::-webkit-calendar-picker-indicator]:opacity-80"
					/>
				</div>
				<div class="mx-auto">
					<span class="font-bold text-sm opacity-45 ml-3">INCLUSIVE DATES</span>
					<div class="border border-slate-200/15 min-h-20 rounded-2xl">
						<table class="border-separate border-spacing-y-1 m-2">
							<thead>
								<tr>
									<th class="w-5"></th>
									<th class="w-60 text-center text-sm">START</th>
									<th class="w-60 text-center text-sm">END</th>
								</tr>
							</thead>
							<tbody>
								<template v-for="(daterange,index) in travel.inclusive_dates" :key="index">
									<tr>
										<td>
											{{ index + 1 }}.
										</td>
										<td class="text-center px-2 h-15">
											<input type="date" v-model="daterange.start"
												class="form-input-style
												scheme-dark w-full
												[&::-webkit-calendar-picker-indicator]:cursor-pointer
												[&::-webkit-calendar-picker-indicator]:opacity-80"/>
										</td>
										<td class="text-center px-2 h-15">
											<input type="date" v-model="daterange.end"
												class="form-input-style w-full
												scheme-dark
												[&::-webkit-calendar-picker-indicator]:cursor-pointer
												[&::-webkit-calendar-picker-indicator]:opacity-80"/>
										</td>
										<td class="flex justify-center items-center h-15">
											<button type="button" 
												title="Delete"
												@click="travel.inclusive_dates.splice(index, 1)"
												class="items-center bg-red-400 hover:bg-red-500 p-3 rounded-lg cursor-pointer">
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
													<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
												</svg>
											</button>
										</td>
									</tr>
								</template>
								<tr>
									<td></td>
									<td></td>
									<td class="opacity-30 text-right pr-5">Add date</td>
									<td class="flex justify-center items-center h-15">
										<button type="button"
											@click="travel.inclusive_dates.push({start: '',end: ''})"
											title="Add appointment date"
											class="bg-amber-200 hover:bg-amber-300 p-3 rounded-lg cursor-pointer text-zinc-700">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
											</svg>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="ml-auto gap-3 flex">
					<button v-if="EditMode" 
						:disabled="isSubmitting"
						type="button"
						@click="router.back()"
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
	import { ref,toRaw,onMounted,watch,computed } from 'vue'
	import { useRoute,useRouter } from 'vue-router'
  	import FormSelect from '../../components/FormDropdown.vue'
  	import Card from '../../components/Card.vue'
  	import MsgBox from '../../components/CustomMsgBox.vue'
	import * as API from '../../services/api.js'
	import * as store from '../../stores/stores.js'
	import * as tools from '../../utils/format.js'

	const travelEntryStore = store.useTravelEntryStore()
	const personnelStore = store.usePersonnelStore()
	const route = useRoute()
	const router = useRouter()
	const EditMode = ref(false)
	const isSubmitting = ref(false)
	const createTravelEntry = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true
		ErrorOccured.value = false;

		try {
			serial_no.value = ''

			const response = await API.createnewTravel(travel.value)
			if (response.success){
				const year = parseInt(response.row.date_received.split('-')[0]);
				const no = response.row.travel_no.toString().padStart(4, "0");
				serial_no.value = `${year}-${no}`
				feedbackmsg.value =`Travel entry created successfully!`;
			}else{
				feedbackmsg.value = 'Error! Failed creating travel entry!'
			}
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = `Error! Failed creating travel entry!\n${error.message}`
			ErrorOccured.value = true;
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}
	const ErrorOccured = ref(false);
	const updateTravelEntry = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true
		ErrorOccured.value = false;
		try {
			serial_no.value = ''
			const year = travelEntryStore.selectedTravelEntry.date_received.split('-')[0];
			const no = travelEntryStore.selectedTravelEntry.travel_no.toString().padStart(4, "0");

			const response = await API.patchTravelEntry(`${year}-${no}`,JSON.parse(JSON.stringify(dirtyFields)))
			if (response.success){
				feedbackmsg.value =`Travel entry ${year}-${no} updated successfully!`;
			}else{
				feedbackmsg.value = 'Error! Failed updating travel entry!'
			}
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = `Error! Failed updating travel entry!\n${error.message}`
			ErrorOccured.value = true;
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}

	const serial_no = ref('')

	const originaltravelEntry = ref(null)
	const travel = ref({
		personnel_uuid: '',
		department: '',
		inclusive_dates: [{start:new Date().toISOString().split('T')[0],end:''}],
		purpose: '',
		whereto: ''
	})

	function clearFields() {
		travel.value = {
			personnel_uuid: '',
			department: '',
			inclusive_dates: [
				{
					start: new Date().toISOString().split('T')[0],
					end: ''
				}
			],
			purpose: '',
			whereto: ''
		}
	};

	const serialize = (number,date) => {
		return `${new Date(date).getFullYear()}-${number.toString().padStart(4,"0")}`
	}

	const dirtyFields = tools.dirtyFields(travel,originaltravelEntry)

	onMounted(async () => {
		EditMode.value = (route.name === 'edit-travelentry')

		if (personnelStore.allDepartments.length === 0){
			await personnelStore.populateDepartments()
		}
		
		if (EditMode.value){
			if (!travelEntryStore.selectedTravelEntry) {
				router.back()
			}else{
				travel.value = {
					personnel_uuid: travelEntryStore.selectedTravelEntry.personnel_uuid,
					department: travelEntryStore.selectedTravelEntry.department,
					inclusive_dates: ConvertPSQLDateRange(travelEntryStore.selectedTravelEntry.inclusive_dates),
					purpose: travelEntryStore.selectedTravelEntry.purpose,
					whereto: travelEntryStore.selectedTravelEntry.whereto
				}

				serial_no.value = serialize(travelEntryStore.selectedTravelEntry.travel_no,travelEntryStore.selectedTravelEntry.date_received)
			}
			originaltravelEntry.value = structuredClone(toRaw(travel.value))
		}
		
		if (personnelStore.allPersonnel.length === 0) {
			await personnelStore.populatePersonnel()
		}
    });

	function ConvertPSQLDateRange(dates){
		// convert psql daterange string to array of daterange
		const cleanedRange = dates.replace(/[{""}]/g, '');
		let regex = /[\[\(][^\]\)]*[\]\)]/g;
  		const match = cleanedRange.trim().match(regex);
		if (match) {
			const daterangesarray = [];
			regex = /\d{4}-\d{2}-\d{2}/g;
			match.forEach(drstr => {
				const dateranges = []
				const datestrmatch = drstr.trim().match(regex);
				if (datestrmatch) {
					datestrmatch.forEach(d =>{
						const [year, month, day] = d.split('-');
						const cleanDate = new Date(Number(year), Number(month) - 1, Number(day));
						dateranges.push(cleanDate)
					})
					
					if (dateranges.length === 1) {
						dateranges.push(dateranges[0])
					}else{
						dateranges[1].setDate(dateranges[1].getDate()-1)
					}

					daterangesarray.push({start:formatToLocalYMD(dateranges[0]),end:formatToLocalYMD(dateranges[1])})
				}
			})

			const seen = new Set();
			const uniqueArray = daterangesarray.filter(item => {
				const key = `${item.start}|${item.end}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});

			return uniqueArray
		}else{
			return ({start:'',end:''});
		};
	}

	const formatToLocalYMD = (dateObj) => {
		if (!dateObj) return '';
		const offset = dateObj.getTimezoneOffset();
		const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
		return localDate.toISOString().split('T')[0];
	};

	const feedbackmsg = ref('Travel entry created successfully!')
	const handleParentAction = () => {
		showfeedback.value = false
		if(!ErrorOccured.value){
			if(EditMode.value){
				router.back()
				travelEntryStore.selectTravelEntry(null)
			}else{
				clearFields();
			}
		}
	};
	const showfeedback = ref(false)

	// const test = computed(() => {
	// 	console.log('COMPUTED RUN')

	// 	return JSON.stringify(travel.value.inclusive_dates)
	// })

	// watch(test, value => {
	// 	console.log('TEST CHANGED:', value)
	// })
</script>