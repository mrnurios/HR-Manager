<template>
	<div class="flex-1 min-h-0 flex flex-col gap-2 py-4">
		<h1 class="opacity-60 text-3xl font-bold">Monthly Summary</h1>
		<!-- <p class="text-slate-400">Welcome to your main layout interface dashboard application.</p> -->

		<div class="flex justify-center gap-3 text-zinc-400">
			<button class="size-10 hover:bg-zinc-900 rounded-md active:scale-90 hover:border hover:border-zinc-700" 
				@click="currentDate = new Date(currentDate.getDate() > 15 ? currentDate.setDate(10) : new Date(currentDate.setMonth(currentDate.getMonth()-1)).setDate(20)); debouncedNextDates()">
				<HI.ChevronLeftIcon class="size-6 m-auto"/>
			</button>
			<!-- <span class="mx-auto font-bold uppercase text-2xl">
				{{ currentDate.toLocaleString('default', { month: 'long' }) }} {{ startNum === 0 ? 1 : startNum }}-{{ startNum === 0 ? endNum : 15+endNum }}, {{ currentDate.toLocaleString('default', { year: 'numeric' }) }}
			</span> -->

			<div 
				@click="monthInputRef?.showPicker()" 
				class="relative cursor-pointer group w-fit"
			>
				<input 
					@change="debouncedNextDates()"
					ref="monthInputRef"
					v-model="formattedMonthString"
					type="month"
					aria-label="Select month and year"
					class="select-none caret-transparent w-fit text-2xl font-bold shrink h-full focus:outline-none group-hover:text-zinc-700
					transition-all pr-1 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
				/>
				<div class="absolute inset-y-0 right-0 flex items-center pointer-events-none">
					<HISolid.CalendarIcon class="size-7 text-zinc-400 font-extralight group-hover:text-zinc-700 transition-colors" />
				</div>
			</div>
			<button class="size-10 hover:bg-zinc-900 rounded-md active:scale-90 hover:border hover:border-zinc-600"
				@click="currentDate = new Date(currentDate.getDate() > 15 ? new Date(currentDate.setMonth(currentDate.getMonth()+1)).setDate(10): currentDate.setDate(20)); debouncedNextDates()">
				<HI.ChevronRightIcon class="size-6 m-auto"/>
			</button>
		</div>
		<div class="flex-1 min-h-0 border border-zinc-800 rounded-xl overflow-clip">
			<div class="max-h-full overflow-auto rounded-lg">
				<table class="w-full table-auto relative ">
					<thead class="text-zinc-400 uppercase sticky border-b border-zinc-900 top-0 bg-zinc-900">
						<tr>
							<th class="p-2 whitespace-nowrap w-40 text-xs font-normal">Name</th>
							<th v-for="n in endNum" class="w-10 text-xs font-normal">
								{{ n + startNum }}
							</th>
						</tr>
					</thead>
					<tbody class="text-sm">
						<template v-if="isLoading">
							<!-- Loop 8 dummy lines to create visual weight -->
							<tr v-for="n in 8" :key="'skeleton-' + n" class="animate-pulse-slow bg-zinc-900 h-11">
								<!-- match number of columns -->
								<td v-for="d in endNum + 1" class="p-3"> 
									<div class="h-4 w-full rounded-md bg-zinc-800"></div>
								</td>
							</tr>
						</template>
						<tr v-else v-for="personnel in personnelRecords" :key="personnel.personnel_uuid" class="hover:bg-zinc-800/20 bg-zinc-900" >
							<td class="px-4 whitespace-nowrap">{{ Humanize.capitalize(personnel.last_name.trim().toLowerCase()) }}, {{ Humanize.capitalizeAll(personnel.first_name.trim().toLowerCase()) }}</td>
							<td v-for="n in endNum" class="w-10 text-center p-0.5 text-xs group">
								<div class="border border-zinc-800 rounded-md group-hover:border-2 group-hover:border-zinc-600 overflow-clip text-zinc-200 h-10">
									<div class="w-full h-1/2" 
										:class="{
											'bg-green-700' : getRecordValue(personnel.all_travel_arrays,personnel.all_pass_slips,n + startNum) === 1
										}">
										{{  getRecordValue(personnel.all_travel_arrays,personnel.all_pass_slips,n + startNum) === 1 ? 'TE' : '' }}
									</div>
									<div class="w-full h-1/2" 
										:class="{
											'bg-blue-700' : getRecordValue(personnel.all_travel_arrays,personnel.all_pass_slips,n + startNum) === 2,
										}">
										{{  getRecordValue(personnel.all_travel_arrays,personnel.all_pass_slips,n + startNum) === 2 ? 'PS' : '' }}
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref,onMounted,computed,watch } from 'vue';
	import { usePersonnelStore } from '../stores/stores.js'
	import * as Humanize from 'humanize-plus'
	import * as API from '../services/api.js'
	import { useDebounceFn } from '@vueuse/core';
	import * as HI from '@heroicons/vue/24/outline'
	import * as HISolid from '@heroicons/vue/24/solid'
	import { useDateFormat } from '@vueuse/core'

	const personnelStore = usePersonnelStore()
	const isLoading = ref(false)
	const currentDate = ref(new Date())
	const totalDays = computed(() =>{
		const year = currentDate.value.getFullYear();
		const nextMonth = currentDate.value.getMonth() + 1;
		return new Date(year, nextMonth, 0).getDate();
	})

	const startNum = computed(()=>{
		if (currentDate.value.getDate() < 15) return 0;
		return 15;
	});

	const endNum = computed(()=>{
		if (currentDate.value.getDate() > 15) return totalDays.value - 15;
		return 15;
	});
	
	const travelandpassslips = ref([])
	const personnelRecords = computed(()=>{
		const recordsMap = new Map(
			(travelandpassslips.value || []).map(row => [row.personnel_uuid, row])
		);

		const mergedRecords = [...personnelStore.allPersonnel]

		return mergedRecords.map(personnel => {
			const records = recordsMap.get(personnel.personnel_uuid);

			return {
				...personnel,
				all_travel_arrays: records?.all_travel_arrays || [],
				all_pass_slips: records?.all_pass_slips || []
			};
		});
	})

	const monthInputRef = ref(null)
	const formattedMonthString = computed({
		get() {
			// Converts JS Date object to "YYYY-MM"
			return useDateFormat(currentDate.value, 'YYYY-MM').value
		},
		set(newValue) {
			// Append a default day "-01" so the string can parse accurately into a JS Date object
			if (newValue) currentDate.value = new Date(`${newValue}-01`)
		}
	})

	function getRecordValue(travels,pass_slips,currentday){
		if (pass_slips.length === 0 && travels.length === 0) return 0;

		const datetocompare = new Date()
		datetocompare.setFullYear(currentDate.value.getFullYear(),currentDate.value.getMonth(),currentday)
		const datestr = datetocompare.toLocaleDateString()

		if (pass_slips.length > 0) {
			const hasPassSlip = pass_slips.some(date => {
				return new Date(date).toLocaleDateString() === datestr;
			});

			if (hasPassSlip) return 2;
		}

		if (travels.length > 0) {
			const travelentries = travels.flat()
			for (const daterange of travelentries) {
				const dateranges = ConvertPSQLDateRangeString(daterange);
				
				const hasTravelEntry = dateranges.some(date => {
					return date.toLocaleDateString() === datestr;
				});

				if (hasTravelEntry) {
					return 1;
				}
			}
		}
	}

	function ConvertPSQLDateRangeString(dates){
		const cleanedRange = dates.replace(/[{""}]/g, '');
		// let regex = /([\[\(])[^,]+,[^,]+([\]\)])/g;
		let regex = /([\[\(])[^,]+(?:,[^,]*)*([\]\)])/g;
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
						daterangesarray.push(dateranges)
					}else{
						dateranges[1].setDate(dateranges[1].getDate()-1)

						const dates = []

						for (
							let date = dateranges[0];
							date <= dateranges[1];
							date.setDate(date.getDate() + 1)
						) {
							dates.push(new Date(date))
						}

						const uniqueDates = Array.from(
							new Set(dates.map(date => date.getTime()))
						).map(time => new Date(time));

						daterangesarray.push(uniqueDates)
					}
				}
			})

			return daterangesarray.flat();
		}else{
			return [];
		};
	}
	
	async function getRecords(){
		if (isLoading.value) return;

		isLoading.value = true;

		try{
			const startDateObj = new Date();
			startDateObj.setMonth(currentDate.value.getMonth(),currentDate.value.getDate() > 15 ? 16 : 1);

			const endDateObj = new Date();
			endDateObj.setMonth(currentDate.value.getMonth(),currentDate.value.getDate() <= 15 ? 15 : totalDays.value);

			const result = await API.getPersonnelTravelEntriesandPassSlips(startDateObj,endDateObj)
			travelandpassslips.value = [...result.data]
		}catch (err){
			console.log(err)
		}finally{
			isLoading.value = false;
		}
	}

	onMounted(async () => {
		if (personnelStore.allPersonnel.length === 0) {
			try{
				isLoading.value = true;
				await personnelStore.populatePersonnel();
			}catch (err){
				console.log(err)
			}finally{
				isLoading.value = false;
			}
		}

		getRecords()
	});

	const debouncedNextDates = useDebounceFn(getRecords, 500);
</script>