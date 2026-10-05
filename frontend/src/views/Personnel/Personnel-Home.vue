<template>
	<div class="flex flex-col gap-y-2 py-4">
		<div class="flex items-center">

			<RouterLink 
				:to="{ name: 'add-personnel' }" 
				class="bg-amber-200 hover:bg-amber-300 text-zinc-950 rounded-lg font-semibold py-2 px-3 mr-auto"
			>
				+ Add
			</RouterLink>
			
			<div class="relative flex-1">
				<div class="flex items-center h-11 before:absolute before:top-0 before:left-[1%] before:w-[95%] before:h-px before:bg-linear-to-r before:from-transparent before:via-zinc-800 before:to-transparent
						after:absolute after:bottom-0 after:left-[1%] after:w-[95%] after:h-px after:bg-linear-to-r after:from-transparent after:via-zinc-800 after:to-transparent">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-6 text-zinc-500">
						<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
					</svg>
					<form @submit.prevent="onSearchSubmit" class="w-full">
						<input v-model="searchQuery" class="w-full outline-none h-full" type="text" placeholder="Search all profiles..."/>
					</form>
				</div>
			</div>
			
		</div>

		<div class="flex flex-wrap gap-1 items-center text-xs">
			<div class="border border-zinc-800 rounded-full overflow-clip flex flex-nowrap">
				<button
					v-for="filter in ['all', 'permanent','joborder','elective']"
					:key="filter"
					@click="selectEmploymentFilter(filter)"
					class="py-2 px-3 font-medium transition"
					:class="
						selectedEmploymentFilter === filter
							? 'bg-amber-200 text-zinc-900 shadow'
							: 'text-zinc-500 hover:bg-zinc-900'
					"
				>
					{{
						{ 
							'all': 'All', 
							'joborder': 'Job Order', 
							'permanent': 'Regular', 
							'elective': 'Elective' 
						}[filter] 
					}}
				</button>
			</div>
			<div class="border border-zinc-800 rounded-full overflow-clip w-fit flex">
				<button
					v-for="filter in ['all','true','false','undefined']"
					:key="filter"
					@click="selectActiveFilter(filter)"
					class="py-2 px-3 font-medium transition"
					:class="
						selectedActiveFilter === filter
							? 'bg-amber-200 text-zinc-900 shadow'
							: 'text-zinc-500 hover:bg-zinc-900'
					"
				>
					{{
						{ 
							'all': 'All', 
							'true': 'Active', 
							'false': 'Inactive', 
							'undefined': 'Undefined' 
						}[filter] 
					}}
				</button>
			</div>
			<div class="border border-zinc-800 rounded-xl overflow-clip w-fit flex">
				<select class="py-2 px-3 text-zinc-500 font-medium"
					v-model="selectedBirthMonthFilter"
					@change="selectBirthMonthFilter(selectedBirthMonthFilter)">
					<option value="all">All Birth Months</option>
					<option :value="currentMonth">Current Month</option>
					<option value="1">January</option>
					<option value="2">February</option>
					<option value="3">March</option>
					<option value="4">April</option>
					<option value="5">May</option>
					<option value="6">June</option>
					<option value="7">July</option>
					<option value="8">August</option>
					<option value="9">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				</select>
			</div>
			<!-- <span class="mx-auto whitespace-nowrap text-zinc-400">{{ filteredPersonnel.length }} employees</span> -->
		</div>
			
		<div class="md:min-w-2xl lg:min-w-5xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 md:gap-2">
			<!-- Profile Card Container Loop -->
			<div
				@click="router.push({
					name: 'view-personnel',
					params: { id: `${row.personnel_uuid}`}
				}); personnelStore.selectPersonnel(row)"

				v-for="(row, index) in filteredPersonnel" 
					:key="index"
					class="group backdrop-blur-xs hover:z-50 hover:scale-120 shadow-lg min-h-15 p-2 items-center rounded-md md:rounded-xl border border-zinc-700/50 hover:border-zinc-700 transition-all flex flex-col gap-2"
					:class="checkActiveEmployment(row.appointment_dates) ? 'bg-zinc-800/50':'bg-red-700/20'"
				>
				<div class="flex items-center h-full w-full gap-2 relative">
					<div class="flex size-12 shrink-0 rounded-lg text-zinc-300 font-bold border border-zinc-700/50 items-center justify-center text-lg capitalize">
						{{ row.first_name?.[0] }}
					</div>
					<div class="flex flex-col overflow-hidden gap-1">
						<h3 class="text-zinc-200 font-semibold leading-tight text-xs">
							{{ Humanize.capitalizeAll(row.last_name.toLowerCase()) }}, {{ Humanize.capitalizeAll(row.first_name.toLowerCase()) }} <span class="uppercase">{{ row.middle_name ? row.middle_name[0] + '.' : '' }}</span> {{ titleCase(row.ext) }}
						</h3>
						<div class="text-xs capitalize space-1 flex flex-wrap h-fit">
							<span class="inline-flex items-center rounded-full whitespace-nowrap h-5 px-2" 
								:class="{
								'bg-amber-400/80 text-amber-950': row.personnel_type === 'joborder',
								'bg-slate-400 text-slate-950': row.personnel_type === 'permanent',
								'bg-blue-400 text-blue-950': row.personnel_type === 'elective',
								'bg-purple-400 text-yellow-950': row.personnel_type === 'coterminous'
								}"
							>
								{{ titleCase(row.personnel_type) }}
							</span>
						</div>
					</div>
					<div class="hidden absolute group-hover:block top-0 right-0 text-xs space-x-1">
						<button title="Edit" @click.stop="router.push({
								name: 'edit-personnel',
								params: { id: `${row.personnel_uuid}`}
							})"
							class="rounded-sm p-1 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
							<HISolid.PencilIcon class="size-3"/>
						</button>
						<button title="Delete" @click.stop="deletePersonnel(row.personnel_uuid)"
							class="bg-red-300 hover:bg-red-300/80 text-red-800 rounded-sm p-1">
							<HISolid.TrashIcon class="size-3"/>
						</button>
					</div>
				</div>
			</div>
			<!-- <RouterLink
				:to="{
					name: 'view-personnel',
					params: { id: `${row.personnel_uuid}`}
				}"
				:state="{ fromList: true }"

				@click="personnelStore.selectPersonnel(row)"

				v-for="(row, index) in filteredPersonnel" 
					:key="index"
					class="shadow-lg min-h-72 p-3 md:p-4 rounded-md md:rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-700 transition-all flex flex-col justify-between"
				>
				<div class="flex flex-col h-full">
					<div class="flex items-center">
						<span class="rounded-full font-semibold text-xs inline-flex items-center uppercase whitespace-nowrap h-5 px-2 mr-auto" 
							:class="row.is_active ?  'bg-green-300/60 text-green-950'
							: row.is_active === false ? 'bg-red-300/60 text-red-950'
							: 'text-zinc-600'">
							{{ row.is_active === true
								? 'active'
								: row.is_active === false
								? 'inactive'
								: 'Undefined'
							}}
						</span>
						<p class="text-xs text-zinc-400 truncate max-w-max ml-auto">
							{{personnelStore.getDepartment(row.dep_id)?.dep_code || '' }}
						</p>
					</div>

					<div class="flex items-center gap-2 mb-2 h-20">
						<div class="flex size-12 shrink-0 rounded-2xl bg-zinc-800 text-zinc-300 font-bold  items-center justify-center text-lg capitalize">
							{{ row.first_name?.[0] }}
						</div>
						<div class="space-y-1 overflow-hidden">
							<h3 class="text-zinc-200 font-semibold leading-tight text-sm">
								{{ Humanize.capitalizeAll(row.last_name.toLowerCase()) }}, {{ Humanize.capitalizeAll(row.first_name.toLowerCase()) }} <span class="uppercase">{{ row.middle_name ? row.middle_name[0] + '.' : '' }}</span> {{ titleCase(row.ext) }}
							</h3>
							<div class="text-xs capitalize space-1 flex flex-wrap h-fit">
								<span class="inline-flex items-center rounded-full whitespace-nowrap h-5 px-2" 
									:class="{
									'bg-amber-400 text-amber-950': row.personnel_type === 'joborder',
									'bg-slate-400 text-slate-950': row.personnel_type === 'permanent',
									'bg-blue-400 text-blue-950': row.personnel_type === 'elective',
									'bg-purple-400 text-yellow-950': row.personnel_type === 'coterminous'
									}"
								>
									{{ titleCase(row.personnel_type) }}
								</span>
								<span v-if="row.is_pwd" class="inline-flex items-center bg-blue-900 rounded-full whitespace-nowrap h-5 px-2 text-center">
									PWD
								</span>
								<span v-if="row.birthdate !== null && checkMinorStatus(row.birthdate)" class="inline-flex items-center bg-amber-700 rounded-full whitespace-nowrap h-5 px-2">
									Minor
								</span>
								<span v-if="row.is_soloparent" class="bg-zinc-700 rounded-full whitespace-nowrap h-5 px-2 inline-flex items-center">
									Solo Parent
								</span>
							</div>
						</div>
					</div>

					<div class="flex-1 flex flex-wrap gap-y-1 gap-x-2 border-t border-zinc-800/60 pt-2 text-xs text-zinc-400">
						<div class="w-full flex gap-x-2" v-if="row.birthdate !== null">
							<div>
								<span class="text-xs text-zinc-500/75 block uppercase tracking-wider font-semibold">Age</span>
								<span>{{ getAge(row.birthdate) }}</span>
							</div>
							<div>
								<span class="text-xs text-zinc-500/75 block uppercase tracking-wider font-semibold">Birthdate</span>
								<span>{{ new Date(row.birthdate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) }}</span>
							</div>
						</div>
						<div class="w-full">
							<span class="text-xs text-zinc-500/75 block uppercase tracking-wider font-semibold">Contact</span>
							<span>{{ row.contact_number || 'No contact number' }}</span>
						</div>
						<div>
							<span class="text-xs text-zinc-500/75 block uppercase tracking-wider font-semibold">Address</span>
							<span class="line-clamp-2">
								{{ row.barangay ? `${row.barangay}, ${row.purok}` : 'No address provided' }}
							</span>
						</div>
					</div>

					<div class="mt-6 pt-3 border-t border-zinc-800/40 text-xs text-zinc-500 flex justify-between flex-wrap">
						<span class="tracking-wider">APPOINTMENT</span>
						<span class="text-zinc-400">{{ getlatestappointment(row) }}</span>
					</div>
				</div>
			</RouterLink> -->

			<RouterLink 
					v-if="$route.name !== 'add-personnel'" 
					:to="{ name: 'add-personnel' }"
					class="min-h-15 rounded-xl border-3 border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-700 hover:text-zinc-400 transition-all flex cursor-pointer"
				>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10 mx-auto my-auto">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
			</RouterLink>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted,computed,watch } from 'vue';
	import { useRouter,useRoute } from 'vue-router'
	import * as API from '../../services/api.js'
	import * as tools from '../../utils/format.js'
	import { usePersonnelStore } from '../../stores/stores.js'
	import * as Humanize from 'humanize-plus'
	import * as HI from '@heroicons/vue/24/outline'
	import * as HISolid from '@heroicons/vue/24/solid'

	const router = useRouter();
	const route = useRoute();
	
	const personnelStore = usePersonnelStore()
	const selectedEmploymentFilter = ref(localStorage.getItem('personnelEmploymentFilter') || 'all')
	function selectEmploymentFilter(filter) {
		selectedEmploymentFilter.value = filter
		localStorage.setItem('personnelEmploymentFilter', filter)
	}
	function parseBoolean(value) {
		if (value === 'true') return true
		if (value === 'false') return false
		return undefined
	}
	const selectedActiveFilter = ref(localStorage.getItem('personnelActiveFilter') || 'all')
	function selectActiveFilter(filter) {
		selectedActiveFilter.value = filter
		localStorage.setItem('personnelActiveFilter', filter)
	}
	const selectedBirthMonthFilter = ref(localStorage.getItem('personnelBirthMonthFilter') || 'all')
	function selectBirthMonthFilter(filter) {
		selectedBirthMonthFilter.value = filter
		localStorage.setItem('personnelBirthMonthFilter', filter)
	}
	
	const filteredPersonnel = computed(() => {
		if (searchMode.value){
			return searchQueries.value.filter(row => {
				// Employment type
				if (
					selectedEmploymentFilter.value !== 'all' &&
					row.personnel_type?.toLowerCase() !== selectedEmploymentFilter.value
				) {
					return false
				}

				if (selectedActiveFilter.value !== 'all' && row.is_active !== parseBoolean(selectedActiveFilter.value)) {
					return false
				}

				if (selectedBirthMonthFilter.value !== 'all' && (new Date(row.birthdate).getMonth() + 1).toString()!== selectedBirthMonthFilter.value) {
					return false
				}

				return true
			})
		}else{
			return personnelStore.allPersonnel.filter(row => {
				// Employment type
				if (
					selectedEmploymentFilter.value !== 'all' &&
					row.personnel_type?.toLowerCase() !== selectedEmploymentFilter.value
				) {
					return false
				}

				if (selectedActiveFilter.value !== 'all' && row.is_active !== parseBoolean(selectedActiveFilter.value)) {
					return false
				}

				if (selectedBirthMonthFilter.value !== 'all' && (new Date(row.birthdate).getMonth() + 1).toString()!== selectedBirthMonthFilter.value) {
					return false
				}

				return true
			})
		}

	})

	function getAge(birthDateString) {
		if (birthDateString === null) {
		return null};

		const [datePart] = birthDateString.split('T'); // Extracts "2001-10-04"
		const [birthYear, birthMonth, birthDay] = datePart.split('-').map(Number);
		const today = new Date();
		const currentYear = today.getFullYear();
		const currentMonth = today.getMonth() + 1; // JavaScript months are 0-11
		const currentDay = today.getDate();
		let age = currentYear - birthYear;
		const monthDifference = currentMonth - birthMonth;

		// Adjust age if birthday hasn't happened yet this calendar year
		if (monthDifference < 0 || (monthDifference === 0 && currentDay < birthDay)) {
			age--;
		}

		return age;
	}

	function checkMinorStatus(birthDateString) {
		return getAge(birthDateString) < 18;
	};

	const currentMonth = computed(()=>{
		return new Date().getMonth()+1
	})

	const searchQueries = ref([])
	const searchQuery = ref('')
	const searchMode = ref(false)
	const searchQueryPlaceholder = ref('')
	const isLoading = ref(true);
	const errorMessage = ref('');
	const fetchSubjectsFromDB = async (search)=> {
		try {
			isLoading.value = true;
			errorMessage.value = '';
			searchQueryPlaceholder.value = search.trim()

			if (searchQueryPlaceholder.value !== ''){
				const results = await API.searchPersonnel(search)
				searchQueries.value = [...results.rows]
				searchMode.value = true;
			}else{
				await personnelStore.populatePersonnel();
				searchMode.value = false;
			}
		} catch (error) {
			console.error('Database connection failed:', error);
			
			errorMessage.value = error.response?.data?.message || 'Could not connect to database server.';
		} finally {
			isLoading.value = false;
		}
	};

	watch(() => [route.query.search],
		([newSearchQuery]) => {
			const targetSearch = newSearchQuery || ''
			
			searchQuery.value = targetSearch

			fetchSubjectsFromDB(targetSearch)
		},
		{ immediate: true } // Triggers immediately when component mounts
	)

	function titleCase(str) {
		if (!str) return '';

		return str
			.toLowerCase()
			.replace(/\b\w/g, c => c.toUpperCase());
	}

	function getlatestappointment(row) {
		if (row.appointment_dates){
			const strdates = row.appointment_dates;
			if (!strdates.length) return 'NaN';
			const recentdate = new Date(strdates[0][0])
			return tools.datetoStr(recentdate)
		}
		return 'NaN';
	}

	function checkActiveEmployment(dates) {
		if (dates){
			const strdates = dates;
			if (!strdates.length) return true;

			if (strdates[strdates.length-1][1] !== '') {
				const d1 = new Date(strdates[strdates.length-1][0]).toISOString().split('T')[0]
				const d2 = (new Date()).toISOString().split('T')[0]
				return d1 <= d2
			}
		}

		return true;
	}

	function onSearchSubmit() {
		router.push({
			query: {
				...route.query,
				search: searchQuery.value || undefined, // undefined strips empty '?search=' clean from the URL
			}
		})
	}

	async function deletePersonnel(uuid) {
		const confirmed = window.confirm(
			'Are you sure you want to delete this personnel?'
		)

		if (!confirmed) return

		try {
			const result = await API.deletePersonnel(uuid)

			if (result.success) {
				const indexpos = personnelStore.allPersonnel.findIndex(
					person => person.personnel_uuid === uuid
				)

				if (indexpos >= 0) {
					personnelStore.allPersonnel.splice(indexpos, 1)
				}

				router.back()
			}
		} catch (error) {
			console.error('Database connection failed:', error)
			errorMessage.value =
				error.response?.data?.message ||
				'Could not connect to database server.'
		}
	}
</script>
