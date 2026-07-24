<script setup>
	import { ref, onMounted } from 'vue';
	import { useRouter } from 'vue-router'
	import Card from '../components/Card.vue'
	import api from '../services/api.js'

	// const router = useRouter()

	const columns = ref([
		{ key: 'yearly_id', label: 'ID' },
		{ key: 'full_name', label: 'Name' },      // Custom calculated column (see below)
		{ key: 'civil_status', label: 'Status' }
	]);

	const data = ref([]);

	function getAge(birthDateString) {
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

	const isLoading = ref(true);
	const errorMessage = ref('');
	const fetchSubjectsFromDB = async () => {
		try {
			isLoading.value = true;
			errorMessage.value = '';
			
			// Change this to match your real backend API route endpoint
			// const response = await api.get('/subjects');
			
			// Axios puts the parsed JSON payload payload inside the .data wrapper automatically
			// data.value = response.data.data.rows;
			// console.log(response.data.data.rows)
		} catch (error) {
			console.error('Database connection failed:', error);
			
			// Check if the backend sent a specific database execution error message
			errorMessage.value = error.response?.data?.message || 'Could not connect to database server.';
		} finally {
			isLoading.value = false;
		}
	};

	onMounted(() => {
		fetchSubjectsFromDB();
	});
</script>

<template>
	<div class="flex flex-col gap-y-5">
		<RouterLink 
			v-if="$route.name !== 'add-personnel'" 
			:to="{ name: 'add-personnel' }" 
			class="bg-amber-200 hover:bg-amber-300 text-zinc-950 rounded-xl font-semibold p-4 mr-auto"
		>
			+ Add
		</RouterLink>

		<div class="relative">
			<div class="flex items-center w-full h-17 before:absolute before:top-0 before:left-[1%] before:w-[95%] before:h-px before:bg-linear-to-r before:from-transparent before:via-zinc-800 before:to-transparent
  					after:absolute after:bottom-0 after:left-[1%] after:w-[95%] after:h-px after:bg-linear-to-r after:from-transparent after:via-zinc-800 after:to-transparent">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-6 text-zinc-500">
  					<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
				</svg>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mr-3 text-zinc-500 hover:text-zinc-300 cursor-pointer">
  					<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
				</svg>
				<input class="w-full outline-none h-full" type="text" placeholder="Search all profiles..."/>
			</div>
		</div>

		<div>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 h-96">
				<!-- Profile Card Container Loop -->
				<div 
					v-for="(row, index) in data" 
					:key="index" 
					class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
				>
					<!-- Top Section: Header & Avatar Placeholder -->
					<div>
						<div class="flex items-center gap-4 mb-4">
							<!-- Simple Avatar with First Initial -->
							<div class="size-12 shrink-0 rounded-2xl bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-lg capitalize">
								{{ row.first_name?.[0] }}
							</div>
							
							<!-- User ID & Name Mapping -->
							<div class="space-y-1">
								<span class="text-xs font-mono text-zinc-500">
									MSWD-{{ new Date(row.created_at).getFullYear() }}-{{ String(row.yearly_id).padStart(5, '0') }}
								</span>
								<h3 class="text-zinc-200 font-semibold leading-tight">
									{{ row.last_name }}, {{ row.first_name }} {{ row.middle_name ? row.middle_name[0] + '.' : '' }} {{ row.ext_name }}
								</h3>
								<div class="text-xs capitalize space-x-1 space-y-1 flex flex-wrap h-fit">
									<span v-if="!checkMinorStatus(row.birth_date)" class="inline-flex items-center bg-zinc-700 rounded-full whitespace-nowrap h-5 px-2">
										{{ row.civil_status }}
									</span>
									<span v-if="row.is_pwd" class="inline-flex items-center bg-blue-900 rounded-full whitespace-nowrap h-5 px-2 text-center">
										PWD
									</span>
									<span v-if="checkMinorStatus(row.birth_date)" class="inline-flex items-center bg-amber-700 rounded-full whitespace-nowrap h-5 px-2">
										Minor
									</span>
									<span v-if="row.is_guardian" class="bg-zinc-700 rounded-full whitespace-nowrap h-5 px-2 inline-flex items-center">
										Guardian
									</span>
								</div>
							</div>
						</div>

						<!-- Middle Section: Contact & Bio Attributes -->
						<div class="flex flex-wrap gap-y-2 gap-x-4 border-t border-zinc-800/60 pt-4 text-sm text-zinc-400">
							<div class="w-full flex gap-x-4 ">
								<div>
									<span class="text-xs text-zinc-600 block uppercase tracking-wider font-semibold">Age</span>
									<span>{{ getAge(row.birth_date) }}</span>
								</div>
								<div>
									<span class="text-xs text-zinc-600 block uppercase tracking-wider font-semibold">Birthdate</span>
									<span>{{ new Date(row.birth_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) }}</span>
								</div>
							</div>
							<div class="w-full">
								<span class="text-xs text-zinc-600 block uppercase tracking-wider font-semibold">Contact</span>
								<span>{{ row.contact_number || 'No contact number' }}</span>
							</div>
							<div>
								<span class="text-xs text-zinc-600 block uppercase tracking-wider font-semibold">Address</span>
								<span class="line-clamp-2">
									{{ row.address ? row.address.replace('|', ', ') : 'No address provided' }}
								</span>
							</div>
						</div>
					</div>

					<!-- Bottom Section: Registration Year Metadata -->
					<div class="mt-6 pt-3 border-t border-zinc-800/40 text-xs text-zinc-600 flex justify-between">
						<span>Recorded</span>
						<span>{{ row.created_at ? row.created_at.slice(0, 4) : 'N/A' }}</span>
					</div>
				</div>
				<RouterLink 
						v-if="$route.name !== 'add-personnel'" 
						:to="{ name: 'add-personnel' }" 
						class="p-6 rounded-3xl border-3 border-dashed border-zinc-900 hover:border-zinc-700 text-zinc-800 hover:text-zinc-400 transition-all flex cursor-pointer"
					>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10 mx-auto my-auto">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
				</RouterLink>
			</div>

			<!-- Empty Fallback Indicator -->
			<!-- <div v-else class="text-center py-12 text-zinc-500">
				No profiles available to display.
			</div> -->
		</div>
	</div>
   
</template>