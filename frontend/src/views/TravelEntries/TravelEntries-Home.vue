<template>
	<div class="flex-1 min-h-0 flex flex-col gap-2 py-4">
		<div class="flex items-center">
			<RouterLink 
				to="/travel/add" 
				class="bg-amber-200 hover:bg-amber-300 text-zinc-950 rounded-lg font-semibold h-fit py-2 px-3 mr-auto whitespace-nowrap"
				>
				+ Add
			</RouterLink>
			<div class="flex-1 top relative flex">
				<div class="flex items-center w-full h-11 before:absolute before:top-0 before:left-[1%] before:w-[95%] before:h-px before:bg-linear-to-r before:from-transparent before:via-zinc-800 before:to-transparent
						after:absolute after:bottom-0 after:left-[1%] after:w-[95%] after:h-px after:bg-linear-to-r after:from-transparent after:via-zinc-800 after:to-transparent">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-6 text-zinc-500">
						<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
					</svg>
					<form @submit.prevent="onSearchSubmit" class="w-full">
						<input v-model="searchQuery" class="w-full outline-none h-full" type="text" placeholder="Search all entries..."/>
					</form>
				</div>
			</div>
		</div>

		<div class="flex-1 min-h-0 overflow-clip border border-zinc-700/50 shadow-sm rounded-lg flex">
			<!-- Empty Loading/Fallback State -->
			<div v-if="!isLoading && data.length === 0" class="text-center text-gray-500 shadow-sm rounded-lg m-auto">
				No travel entries found.
			</div>

			<!-- Data Table Container -->
			<div v-else class="max-h-full overflow-y-auto w-full relative">
				<table class="w-full text-left border-collapse text-sm relative">
					<thead class="bg-zinc-900 text-zinc-400 font-semibold uppercase border-b border-zinc-900 sticky top-0">
						<tr>
							<th class="p-2 text-xs font-normal text-center">Serial</th>
							<th class="p-2 text-xs font-normal">Name</th>
							<th class="p-2 text-xs font-normal text-center">Inclusive Dates</th>
							<th class="p-2 text-xs font-normal">Destination / Purpose</th>
							<th class="p-2 text-xs font-normal text-center">Status</th>
							<th class="p-2 text-xs font-normal text-center">Actions</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-zinc-700 text-zinc-400 text-sm">
						<template v-if="isLoading">
							<!-- Loop 8 dummy lines to create visual weight -->
							<tr v-for="n in 8" :key="'skeleton-' + n" class="animate-pulse-slow bg-zinc-900">
								<!-- match number of columns -->
								<td v-for="d in 6" class="p-3"> 
									<div class="h-4 w-full bg-zinc-800 rounded-md"></div>
								</td>
							</tr>
						</template>
						<template v-else>
							<tr
								v-for="(entry,i) in data" 
								:key="entry.id || entry.serial" 
								class="hover:bg-zinc-800 transition-colors bg-zinc-900"
								
							>
								<td class="p-2 whitespace-nowrap font-mono text-center">
									{{ entry.date_received.split('-')[0] }}-{{ String(entry.travel_no).padStart(4, '0') }}
								</td>

								<!-- Name -->
								<td class="p-2 text-zinc-300 truncate">
									<span v-if="entry.personnel_first_name">
										{{ Humanize.capitalizeAll(entry.personnel_first_name.toLowerCase()) }} {{ Humanize.capitalizeAll(entry.personnel_last_name.toLowerCase()) }}
									</span>
								</td>

								<td class="text-center">
									<div class="flex gap-1 justify-center">
										<span v-for="date in ConvertPSQLDateRangeString(entry.inclusive_dates)"
											class="py-0.5 px-2 bg-slate-400 text-slate-950 rounded-full whitespace-nowrap text-xs">
											{{ date }}
										</span>
									</div>
									
								</td>

								<td class="p-2 truncate max-w-xs">
									{{ Humanize.capitalizeAll(entry.whereto.toLowerCase()) }} - {{ Humanize.capitalize( entry.purpose.toLowerCase()) }}
								</td>

								<td class="p-2 text-center">
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
										:class="{
											'bg-yellow-100 text-yellow-800': entry.status === 0,
											'bg-red-100 text-red-800': entry.status === 1 || entry.status === 3,
											'bg-green-100 text-green-800': entry.status === 2,
											'bg-gray-100 text-gray-800': !entry.status
										}"
									>
										{{
											entry.status_label
										}}
									</span>
								</td>

								<td class="text-center space-x-2 flex justify-center p-2">
									<div class="flex rounded-md overflow-clip shadow-md items-center">
										<button v-if="entry.status_label !== 'Approved' && entry.status_label !== 'Rejected'"
											title="Approve"
											@click.stop="updateEntry(2,entry)"
											class="hover:bg-green-300 font-medium cursor-pointer text-green-800 border-r border-zinc-700"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5 mx-auto">
												<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
											</svg>
										</button>
										<button v-if="entry.status_label !== 'Approved' && entry.status_label !== 'Rejected'"
											title="Reject"
											@click.stop="updateEntry(3,entry)" 
											class="hover:bg-red-300 font-medium cursor-pointer text-red-800 border-r border-zinc-700"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5 mx-auto">
												<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
											</svg>
										</button>
										<button
											v-if="entry.status_label !== 'Cancelled'"
											@click.stop="updateEntry(1,entry)" 
											class="text-red-500 hover:text-blue-900 font-medium cursor-pointer flex-1 px-2"
										>
											Cancel
										</button>
									</div>
									
									<button
										@click.stop="editEntry(entry)" 
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
	import * as Humanize from 'humanize-plus'
	import * as store from '../../stores/stores.js'

    const route = useRoute()
	const router = useRouter()

	const travelentryStore = store.useTravelEntryStore()

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
				response = await API.searchTravel(search,page)
				inquired.value = true;
			}else{
				response = await API.getTravelEntriesByPage(page)
				inquired.value = false;
			}

			if (response !== '') {
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

			// Run the safe single database fetch pass
			fetchEntriesFromDB(targetPage, targetSearch)
		},
		{ immediate: true } // Triggers immediately when component mounts
	)

	function FormatDateRangeArray(dr){
		const formattedrange = []
		dr.forEach(r =>{
			const [startdate,enddate] = r
			let finalformatteddate = '';
			const startmonth =  startdate.toLocaleString('en-US', { month: 'short' });
			const startday = String(startdate.getDate()).padStart(2, '0')
			const startyear = startdate.getFullYear()
			const endmonth =  enddate.toLocaleString('en-US', { month: 'short' });
			const endday = String(enddate.getDate()).padStart(2, '0')
			const endyear = enddate.getFullYear()

			if (startdate.getTime() === enddate.getTime()){
				finalformatteddate = `${startmonth} ${startday}, ${startyear}`
			}else{
				if (startdate.getFullYear() === enddate.getFullYear()){ // handle same year dates
					if (startdate.getMonth() === enddate.getMonth()){ // handle same year and same month dates
						finalformatteddate = `${startmonth} ${startday} - ${endday}, ${startyear}`
					}else{
						finalformatteddate = `${startmonth} ${startday} - ${endmonth} ${endday}, ${startyear}`
					}
				}else{
					finalformatteddate = `${startmonth} ${startday}, ${startyear} - ${endmonth} ${endday}, ${endyear}`
				}
			}
			
			formattedrange.push(finalformatteddate);
		})
		return formattedrange;
	}

	function ConvertPSQLDateRangeString(dates){
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

					daterangesarray.push(dateranges)
				}
			})

			//Remove duplicataes
			const uniqueArray = daterangesarray.filter((currentPair, index) => {
				// Find if an identical date pair exists at a previous index
				const firstIndex = daterangesarray.findIndex(otherPair => 
					currentPair[0].getTime() === otherPair[0].getTime() && 
					currentPair[1].getTime() === otherPair[1].getTime()
				);
				
				// Only keep the item if its current position is the first occurrence
				return index === firstIndex;
			});

			return FormatDateRangeArray(uniqueArray);
		}else{
			return null;
		};
	}

	async function updateEntry(status,entry){
		const result = await API.patchTravelEntry(`${entry.date_received.split('-')[0]}-${entry.travel_no}`,{status: status})
		entry.status = result.row.status
		entry.status_label = result.row.status_label
	}

	function editEntry(entry){
		travelentryStore.selectTravelEntry(entry)
		router.push({
			name: 'edit-travelentry'
		})
	}

	const showrowDetails = ref(false)
	function rowClick(entry){
		showrowDetails.value = true
	}
</script>