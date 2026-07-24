<script setup>
    import { ref,computed,onMounted,watch } from 'vue'
    import { useRoute,useRouter } from 'vue-router'
	import * as API from '../services/api.js'

    const route = useRoute()
	const router = useRouter()

	const data = ref([])
	const searchQuery = ref('')
	const searchQueryPlaceholder = ref('')
	const isLoading = ref(true);
	const errorMessage = ref('');
	const inquired = ref(false)
	const fetchEntriesFromDB = async (page, search) => {
		try {
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
			
			// Run the safe single database fetch pass
			fetchEntriesFromDB(targetPage, targetSearch)
		},
		{ immediate: true } // Triggers immediately when component mounts
	)

	function generatePagination(currentPage, totalPages) {
		const current = currentPage;
		const last = totalPages;

		// If page count is small, just show all numbers sequential
		if (last <= 6) {
			return Array.from({ length: last }, (_, i) => i + 1);
		}

		// Calculate if we need left and right ellipses
		const showLeftEllipsis = current > 3;
		const showRightEllipsis = current < last - 2;

		// Case 1: Only right ellipsis is needed (Near the beginning)
		if (!showLeftEllipsis && showRightEllipsis) {
			return [1, 2, 3, 4, '...', last];
		}

		// Case 2: Only left ellipsis is needed (Near the end)
		if (showLeftEllipsis && !showRightEllipsis) {
			return [1, '...', last - 3 , last - 2, last - 1, last];
		}

		// Case 3: Both ellipses are needed (Right in the middle)
		return [1, '...', current - 1, current, current + 1, '...', last];
	}

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
		let regex = /([\[\(])[^,]+,[^,]+([\]\)])/g;
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
					dateranges[1].setDate(dateranges[1].getDate()-1)
					daterangesarray.push(dateranges)
				}
			})
			return FormatDateRangeArray(daterangesarray);
		}else{
			return null;
		};
	}

	async function updateEntry(status,entry){
		const result = await API.updateTravelStatus(entry.serial_no,status)
		entry.status = result.row.status
		entry.status_label = result.row.status_label
	}

	const showrowDetails = ref(false)
	function rowClick(entry){
		showrowDetails.value = true
	}
</script>

<template>
	<div class="flex flex-col gap-y-5">
		<RouterLink 
			v-if="$route.name !== 'add-travelentry'" 
			:to="{ name: 'add-travelentry' }" 
			class="bg-amber-200 hover:bg-amber-300 text-zinc-950 rounded-xl font-semibold p-4 mr-auto"
		>
			+ Add
		</RouterLink>

		<div class="container h-svh pb-4 flex flex-col overflow-clip ">
			<div class="relative bg-zinc-950/95">
				<div class="flex items-center w-full h-17 before:absolute before:top-0 before:left-[1%] before:w-[95%] before:h-px before:bg-linear-to-r before:from-transparent before:via-zinc-800 before:to-transparent
						after:absolute after:bottom-0 after:left-[1%] after:w-[95%] after:h-px after:bg-linear-to-r after:from-transparent after:via-zinc-800 after:to-transparent">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-6 text-zinc-500">
						<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
					</svg>
					<form @submit.prevent="onSearchSubmit" class="w-full">
						<input v-model="searchQuery" class="w-full outline-none h-full" type="text" placeholder="Search all entries..."/>
					</form>
				</div>
			</div>

			<div v-if="errorMessage" class="text-rose-400 error">{{ errorMessage }}</div>

			<!-- Empty Loading/Fallback State -->
			<div v-if="data.length === 0" class="text-center py-12 text-gray-500 border border-zinc-800 shadow-sm rounded-lg ">
				No travel entries found.
			</div>

			<!-- Data Table Container -->
			<div v-else class="border border-zinc-800 shadow-sm rounded-lg flex-1 min-h-0 w-full relative">
				<div class="h-full w-full overflow-auto border border-zinc-800 shadow-sm rounded-lg">
					<table class="w-full text-left border-collapse text-sm overflow-auto">
						<!-- Table Header -->
						<thead class="bg-zinc-800 text-zinc-400 font-semibold uppercase border-b border-zinc-900">
						<tr>
							<th class="px-6 py-4">Serial</th>
							<th class="px-6 py-4">Name</th>
							<th class="px-6 py-4">Inclusive Dates</th>
							<th class="px-6 py-4">Destination / Purpose</th>
							<th class="px-6 py-4">Status</th>
							<th class="px-6 py-4 text-right">Actions</th>
						</tr>
						</thead>

						<!-- Table Body Rows -->
						<tbody class="divide-y divide-zinc-700">
						<tr
							v-for="(entry,i) in data" 
							:key="entry.id || entry.serial" 
							class="hover:bg-zinc-800 transition-colors bg-zinc-900"
							@click="rowClick(entry)"
						>
							<!-- Serial Number -->
							<td class="p-4 whitespace-nowrap">
								{{ entry.serial_no || entry.id }}
							</td>

							<!-- Name -->
							<td class="p-4 uppercase">
								{{ entry.first_name }} {{ entry.last_name }}
							</td>

							<!-- Department -->
							<td class="space-x-1">
								<span v-for="date in ConvertPSQLDateRangeString(entry.inclusive_dates)"
									class="py-1 px-2 bg-slate-400 text-slate-950 rounded-full whitespace-nowrap text-xs">
									{{ date }}
								</span>
							</td>

							<!-- Destination/Description -->
							<td class="px-6 py-4 truncate max-w-xs">
								{{ entry.destination || entry.purpose || 'No Details Provided' }}
							</td>

							<!-- Conditional Status Badge -->
							<td class="px-6 py-4">
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

							<!-- Action Buttons -->
							<td class="p-4 text-right space-x-2 flex">
								<div class="border border-zinc-700 flex rounded-md overflow-clip bg-zinc-800/90 shadow-md">
									<button v-if="entry.status_label !== 'Approved' && entry.status_label !== 'Rejected'"
										title="Approve"
										@click.stop="updateEntry(2,entry)"
										class="hover:bg-green-300 font-medium cursor-pointer text-green-800 size-8 border-r border-zinc-700"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6 mx-auto">
											<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
										</svg>
									</button>
									<button v-if="entry.status_label !== 'Approved' && entry.status_label !== 'Rejected'"
										title="Reject"
										@click.stop="updateEntry(3,entry)" 
										class="hover:bg-red-300 font-medium cursor-pointer text-red-800 size-8 border-r border-zinc-700"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6 mx-auto">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
										</svg>
									</button>
									<button
										v-if="entry.status_label !== 'Cancelled'"
										@click.stop="updateEntry(1,entry)" 
										class="text-red-500 hover:text-blue-900 font-medium cursor-pointer flex-1 h-8 px-2"
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
						</tbody>
					</table>
				</div>
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

			<!-- Pagination Buttons Wrapper Container -->
			<div v-if="data.length !== 0" class="flex items-center justify-between px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-xs">
				<!-- Left Hand: Mobile Navigation View -->
				<div class="flex flex-1 justify-between sm:hidden">
					<button
						@click="changePage(currentPage - 1)" 
						:disabled="currentPage === 1"
						class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Previous
					</button>
					<button 
						@click="changePage(currentPage + 1)" 
						:disabled="currentPage === totalPages"
						class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next
					</button>
				</div>

				<!-- Right Hand: Desktop Navigation View -->
				<div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
					<div>
						<p class="text-sm text-zinc-500">
							Showing page <span class="font-medium">{{ currentPage }}</span> of <span class="font-medium">{{ totalPages }}</span> pages
							 <span v-if="inquired"> of search '{{ searchQueryPlaceholder }}'</span> 
						</p>
					</div>

					<div>
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
							<template v-for="(item, index) in generatePagination(currentPage, totalPages)" :key="index">
								
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
			</div>
		</div>
	</div>
</template>