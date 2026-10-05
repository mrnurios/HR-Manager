<template>
	<div class="flex-1 flex flex-col min-h-0 gap-y-2 py-4">
		<div class="flex items-center">
			<RouterLink 
			v-if="$route.name !== 'add-passslip'" 
			:to="{ name: 'add-passslip' }" 
			class="bg-amber-200 hover:bg-amber-300 text-zinc-950 rounded-lg font-semibold h-fit py-2 px-3 mr-auto whitespace-nowrap"
			>
				+ Add
			</RouterLink>
			<div class="flex-1 relative">
				<div class="flex items-center w-full h-11 before:absolute before:top-0 before:left-[1%] before:w-[95%] before:h-px before:bg-linear-to-r before:from-transparent before:via-zinc-800 before:to-transparent
						after:absolute after:bottom-0 after:left-[1%] after:w-[95%] after:h-px after:bg-linear-to-r after:from-transparent after:via-zinc-800 after:to-transparent">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-6 text-zinc-500">
						<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
					</svg>
					<form @submit.prevent="onSearchSubmit" class="w-full">
						<input v-model="searchQuery" class="w-full outline-none h-full" type="text" placeholder="Search all pass slips..."/>
					</form>
				</div>
			</div>
		</div>
			
		<div v-if="errorMessage" class="text-rose-400 error">{{ errorMessage }}</div>

		<div class="border border-zinc-700/50 shadow-sm rounded-lg min-h-0 flex-1 w-full relative overflow-clip">
			<div class="max-h-full overflow-y-auto flex-1">
				<table class="w-full h-full text-left border-collapse text-sm relative">
					<thead class="bg-zinc-900 text-zinc-400 font-semibold uppercase border-b border-zinc-900 sticky top-0">
						<tr>
							<th class="p-2 text-xs font-normal text-center">Serial</th>
							<th class="p-2 text-xs font-normal">Name</th>
							<th class="p-2 text-xs font-normal text-center">Inclusive Dates</th>
							<th class="p-2 text-xs font-normal text-center">Purpose</th>
							<th class="p-2 text-xs font-normal text-center">Departure / Arrival Time</th>
							<th class="p-2 text-xs font-normal text-center">Status</th>
							<th class="p-2 text-xs font-normal text-center">Actions</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-zinc-700 text-zinc-400 text-sm">
						<template v-if="isLoading">
							<tr v-for="n in 8" :key="'skeleton-' + n" class="animate-pulse-slow bg-zinc-900">
								<!-- match number of columns -->
								<td v-for="d in 7" class="p-3">
									<div class="h-4 w-full bg-zinc-800 rounded-md"></div>
								</td>
							</tr>
						</template>
						<template v-else>
							<tr
								v-for="(entry,i) in data" 
								:key="entry.id || entry.serial" 
								class="hover:bg-zinc-800 transition-colors bg-zinc-900"
								@click="rowClick(entry)"
							>
								<!-- Serial Number -->
								<td class="p-2 whitespace-nowrap font-mono">
									{{ serialize(entry.pass_no,entry.date_issued) }}
								</td>

								<!-- Name -->
								<td class="p-2 truncate text-zinc-300">
									{{ Humanize.capitalizeAll(entry.first_name.toLowerCase()) }} {{ Humanize.capitalizeAll(entry.last_name.toLowerCase()) }}
								</td>

								<!-- Inclusive Date -->
								<td class="text-center">
									<span class="py-0.5 px-2 bg-slate-400 text-slate-950 rounded-full whitespace-nowrap text-xs">
										{{ formatDate(entry.inclusive_date) }}
									</span>
								</td>

								<!-- Destination/Description -->
								<td class="px-4 py-2 truncate max-w-xs">
									{{ Humanize.capitalizeAll(entry.destination) }} - {{ entry.purpose }}
								</td>

								<td class="px-4 py-2 justify-between">
									<div class="w-full gap-2 flex justify-center">
										<span class="font-mono">{{ formatTime(entry.time_departure)}}</span>
										<span>/</span> 
										<button
											v-if="!entry.time_arrival"
											@click.stop="returned(entry)"
											title="Return"
											class="bg-zinc-800 px-2 border border-zinc-500 font-medium cursor-pointer items-center flex rounded-sm overflow-clip hover:bg-zinc-600"
										>
											Return
										</button>
										<span v-else class="font-mono ">{{formatTime(entry.time_arrival)}}</span>
									</div>
									
								</td>

								<!-- <td class="px-6 py-4 truncate max-w-xs text-center">
									{{ getDuration(entry.time_departure,entry.time_arrival) }}
								</td> -->

								<td class="px-4 py-2 truncate max-w-xs text-center">
									<span class="font-medium py-0.5 px-2 bg-green-100 text-green-800 rounded-full whitespace-nowrap text-xs"
										:class="{'bg-red-100 text-red-800' : !entry.time_arrival}">
										{{ entry.time_arrival ? 'Returned' :  'Yet to return' }}
									</span>
								</td>

								<td class="p-2 text-center text-zinc-300 flex justify-center gap-2">
									<!-- <button
										v-if="!entry.time_arrival"
										@click.stop="returned(entry)"
										title="Approve"
										class="font-medium cursor-pointer items-center flex rounded-md overflow-clip"
									>
										Return
									</button> -->
									<button
										@click.stop="updateEntry(entry)" 
										class="text-amber-600 hover:text-amber-900 font-medium cursor-pointer"
									>
										Edit
									</button>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
				<div v-if="showrowDetails" class="absolute bottom-0 top-0 right-0 w-96 h-full p-6">
					<div class="w-full h-full bg-zinc-800/60 rounded-lg backdrop-blur-sm shadow-md border border-zinc-700">
						<button @click="showrowDetails = false"
							class="cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Pagination Buttons Wrapper Container -->
		<div v-if="data.length !== 0 && !isLoading" class="flex items-center justify-between rounded-lg shadow-xs">
			<nav class="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
				<!-- Previous Chevron Button -->
				<button 
					@click="changePage(currentPage - 1)"
					:disabled="currentPage === 1"
					class="relative inline-flex items-center rounded-l-md px-3 py-2 ring-1 ring-inset ring-zinc-600 hover:bg-zinc-800 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
				>
					&laquo;
				</button>

				<!-- Dynamic Pagination Numbers Loop -->
				<template v-for="(item, index) in format.generatePagination(currentPage, totalPages)" :key="index">
					
					<!-- Structural Case A: It is an Ellipsis Symbol -->
					<span 
						v-if="item === '...'" 
						class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-zinc-600 focus:outline-none"
					>
					...
					</span>

					<!-- Structural Case B: It is an Active/Selectable Number Button -->
					<button 
						v-else
						@click="changePage(item)"
							:class="[
								item === currentPage 
								? 'z-10 bg-amber-200 text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
								: 'text-zinc-400 ring ring-inset ring-zinc-600 hover:bg-zinc-800 focus:outline-offset-0',
								'relative inline-flex items-center px-4 py-2 text-sm font-semibold cursor-pointer'
							]"
						>
						{{ item }}
					</button>
				</template>

				<!-- Next Chevron Button -->
				<button
					@click="changePage(currentPage + 1)"
					:disabled="currentPage === totalPages"
					class="relative inline-flex items-center rounded-r-md px-3 py-2 ring-1 ring-inset ring-zinc-600 hover:bg-zinc-800 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
				>
					&raquo;
				</button>
			</nav>
		</div>
	</div>
</template>

<script setup>
    import { ref,watch } from 'vue'
    import { useRoute,useRouter } from 'vue-router'
	import * as API from '../../services/api.js'
	import * as format from '../../utils/format.js'
	import * as store from '../../stores/stores.js'
	import * as Humanize from 'humanize-plus'
	
	const passSlipStore = store.usePassSlipStore()
    const route = useRoute()
	const router = useRouter()

	const data = ref([])
	const scrollContainer = ref(null)
	const searchQuery = ref('')
	const searchQueryPlaceholder = ref('')
	const isLoading = ref(false);
	const errorMessage = ref('');
	const inquired = ref(false)
	const fetchEntriesFromDB = async (page, search) => {
		try {
			if (isLoading.value) return;

			isLoading.value = true;
			errorMessage.value = '';
			searchQueryPlaceholder.value = search.trim()
			let response = '';
			if (searchQueryPlaceholder.value !== ''){
				response = await API.searchPassSlip(search,page)
				inquired.value = true;
			}else{
				response = await API.getPassSlipsByPage(page)
				inquired.value = false;
			}
			
			if (response !== '') {
				// Axios puts the parsed JSON payload payload inside the .data wrapper automatically
				data.value = response.data;
				currentPage.value = response.page
				totalPages.value = response.totalPages
			}
		} catch (error) {
			console.error('Database connection failed:', error);
			data.value = []
			// Check if the backend sent a specific database execution error message
			errorMessage.value = error.response?.data?.message || 'Could not connect to database server.';
		} finally {
			isLoading.value = false;
		}
	};

	const currentPage = ref(1)
	const totalPages = ref(1)
	// Function triggered when an individual page button is clicked
	function changePage(targetPage) {
		if (targetPage >= 1 && targetPage <= totalPages.value) {
			router.push({
				query: {
					...route.query, // Preserves other filters if you add them later
					page: targetPage
				}
			})
		}
	}

	function onSearchSubmit() {
		router.push({
			query: {
				...route.query,
				search: searchQuery.value || undefined, // undefined strips empty '?search=' clean from the URL
				page: 1 // Crucial rule: Always reset to page 1 whenever a brand new query executes
			}
		})
	}

	watch(() => [route.query.page, route.query.search],
		([newPageQuery, newSearchQuery]) => {
			const targetPage = parseInt(newPageQuery, 10) || 1
			const targetSearch = newSearchQuery || ''
			
			// Synchronize UI component text inputs with the URL value (crucial for initial page deep-linking)
			currentPage.value = targetPage
			searchQuery.value = targetSearch

			if (scrollContainer.value) {
				scrollContainer.value.scrollTop = 0
			}

			fetchEntriesFromDB(targetPage, targetSearch)
		},
		{ immediate: true } // Triggers immediately when component mounts
	)

	const serialize = (number,date) => {
		return `${new Date(date).getFullYear()}-${number.toString().padStart(4,"0")}`
	}

	const formatTime = (time) => {
		if (!time) return "—";

		return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getDuration = (departure, arrival) => {
		if (!departure || !arrival) return "—";

		const [dh, dm, ds = 0] = departure.split(":").map(Number);
		const [ah, am, as = 0] = arrival.split(":").map(Number);

		let departureSeconds = dh * 3600 + dm * 60 + ds;
		let arrivalSeconds = ah * 3600 + am * 60 + as;

		// If arrival is after midnight
		if (arrivalSeconds < departureSeconds) {
			arrivalSeconds += 24 * 3600;
		}

		const duration = arrivalSeconds - departureSeconds;

		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);

		if (duration >= 3600){
			if (minutes === 0 ){
				return `${hours}h`
			}else{
				return `${hours}h ${minutes}m`;
			}
		}else{
			return `${minutes}m`
		}
	};

	const formatDate = (date) => {
		if (!date) return "—";

		return new Date(date).toLocaleDateString([], {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	};

	function updateEntry(entry){
		passSlipStore.selectPassSlipEntry(entry)
		router.push({
			name: 'edit-passslip'
		})
	}

	async function returned(entry){
		const result = await API.patchPassSlip(entry.id,{time_arrival:new Date().toTimeString().slice(0, 5)})
		entry.time_arrival = result.data.rows[0].time_arrival
	}

	const showrowDetails = ref(false)
	function rowClick(entry){
		showrowDetails.value = true
	}
</script>
