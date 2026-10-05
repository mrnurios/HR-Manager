<template>
	<div class="flex-1 flex flex-col gap-y-2 py-4 relative">
		<div class="bg-zinc-900 sticky top-4 flex flex-col gap-2 items-start p-4 border border-zinc-700/50 max-w-4xl w-full h-fit mx-auto rounded-2xl shadow-md">
			<h1 class="opacity-60 text-xl font-bold">{{ EditMode ? 'Edit':'Add' }} Department</h1>
			<form @submit.prevent="EditMode ? updateDep() : createDep()"
				class="w-full">
				<div class="flex w-full h-full gap-0.5">
					<input
						name="Department Code"
						aria-label="Department Code"
						:disabled="isSubmitting"
						ref="FieldInput" 
						v-model="Department.dep_code"
						type="text"
						placeholder="Department Code..."
						class="bg-zinc-950 border border-zinc-800 px-4 focus:outline-none rounded-l-lg"
						required
						/>
					<input
						name="Department Name"
						aria-label="Department Name"
						:disabled="isSubmitting"
						v-model="Department.dep_name"
						type="text"
						placeholder="Department Name..."
						class="bg-zinc-950 border border-zinc-800 flex-1 px-4 focus:outline-none"
						required
						/>
					<button :disabled="isSubmitting" type="button" @click="EditMode = false; clearFields()" v-if="EditMode" class=" text-red-400/90 hover:bg-zinc-800/70 py-2 px-6 border border-zinc-700">
						Cancel
					</button>
					<button :disabled="Object.keys(dirtyFields).length === 0 || isSubmitting" class="disabled:opacity-30 bg-amber-200 enabled:hover:bg-amber-200/70 text-zinc-800 py-2 px-6 rounded-r-lg border border-zinc-700">
						{{ EditMode ? 'Save' : isSubmitting ? 'Submitting...': 'Add' }}
					</button>
				</div>
			</form>
		</div>
			
		<div v-if="errorMessage" class="text-rose-400 error">{{ errorMessage }}</div>

		<div class="h-full text-left border border-zinc-700/50 shadow-sm rounded-2xl flex-1 w-full max-w-4xl mx-auto">
			<table class="w-full">
				<thead class="text-zinc-400/60 border-b border-zinc-800">
					<tr>
						<th class="px-4 py-2 text-xs font-normal">Code</th>
						<th class="px-4 py-2 text-xs font-normal">Name</th>
						<th class="px-4 py-2 text-xs font-normal text-center">Personnel</th>
						<th class="px-4 py-2 text-xs font-normal text-center">Actions</th>
					</tr>
				</thead>

				<tbody class="divide-y divide-zinc-800 text-zinc-400 text-sm">
					<template v-if="isLoading">
						<tr v-for="n in 5" :key="'skeleton-' + n" class="animate-pulse-slow">
							<td v-for="d in 2" class="h-17" >
								<div class="h-full w-full p-6">
									<div class="h-full w-full rounded-full bg-zinc-800"></div>
								</div>
							</td>
							<td class="h-17">
								<div class="h-full w-full p-6 flex gap-x-2">
									<div class="h-full w-full rounded-full bg-zinc-800"></div>
									<div class="h-full w-full rounded-full bg-zinc-800"></div>
								</div>
							</td>
						</tr>
					</template >
					<template v-else>
						<tr
							v-for="(dep,i) in personnelStore.allDepartments" 
							:key="dep.dep_code" 
						>
							<!-- Serial Number -->
							<td class="p-4 whitespace-nowrap font-mono">
								{{ dep.dep_code }}
							</td>

							<!-- Name -->
							<td class="p-4 whitespace-nowrap font-mono">
								{{ dep.dep_name }}
							</td>

							<td class="p-4 whitespace-nowrap font-mono text-center text-lg">
								{{ dep.total_references }}
							</td>

							<td class="p-4 text-center text-zinc-300 flex justify-center gap-2 font-medium text-md">
								<button @click="editDep(dep)"
									class="cursor-pointer hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 px-3 py-2 rounded-md active:scale-90"
								>
									Edit
								</button>
								<button
									@click="deleteDep(dep.dep_id,dep.dep_code)"
									title="Delete department"
									class="cursor-pointer hover:bg-red-700/20 text-red-700 px-3 py-2 rounded-md active:scale-90"
								>
									<!-- <HISolid.TrashIcon class="size-4 "/> -->
										Delete
								</button>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup>
    import { ref,onMounted,toRaw } from 'vue'
    import { useRoute,useRouter } from 'vue-router'
	import * as API from '../../services/api.js'
	import * as format from '../../utils/format.js'
	import * as store from '../../stores/stores.js'
	import * as Humanize from 'humanize-plus'
	import * as HI from '@heroicons/vue/24/outline'
	import * as HISolid from '@heroicons/vue/24/solid'
	import * as tools from '../../utils/format.js'

	const personnelStore = store.usePersonnelStore()
    const route = useRoute()
	const router = useRouter()

	const originalDepartment = ref({})
	const Department = ref({
		dep_code: '',
		dep_name: '',
		dep_id: 0
	})

	const FieldInput = ref(null)

	function clearFields(){
		Department.value = {
			dep_code: '',
			dep_name: '',
			dep_id: 0
		}
		originalDepartment.value = {};
		EditMode.value = false;
	}

	async function createDep(){
		if (isSubmitting.value) return
  		isSubmitting.value = true

		try {
			const response = await API.createDepartment(Department.value)
			if (response.success){
				personnelStore.allDepartments.push(response.row)
				personnelStore.allDepartments.sort((a, b) => a.dep_code.localeCompare(b.dep_code))
				clearFields();
			}
		} catch (error) {
			console.error('Server error message:', error)
		} finally {
			isSubmitting.value = false
		}
	}

	const dirtyFields = tools.dirtyFields(Department,originalDepartment)
	async function updateDep(){
		if (isSubmitting.value) return
  		isSubmitting.value = true

		try {
			const id = originalDepartment.value.dep_id
			const response = await API.patchDepartment(id,JSON.parse(JSON.stringify(dirtyFields)))
			if (response.success){
				const indexpos = personnelStore.allDepartments.findIndex(
					dep => dep.dep_id === id
				)

				if (indexpos >= 0 ){
					personnelStore.allDepartments[indexpos] = response.row
					personnelStore.allDepartments.sort((a, b) => a.dep_code.localeCompare(b.dep_code))
				}
				clearFields();
			}
		} catch (error) {
			console.error('Server error message:', error)
		} finally {
			isSubmitting.value = false
		}
	}

	function editDep(dep){
		EditMode.value = true
		Department.value.dep_code = dep.dep_code
		Department.value.dep_name = dep.dep_name
		Department.value.dep_id = dep.dep_id
		FieldInput.value?.focus()
		originalDepartment.value = structuredClone(toRaw(Department.value));
	}

	async function deleteDep(id,dep_code){
		try {
			const confirmed = window.confirm(`Are you sure you want to delete ${dep_code}?`)
  
			if (!confirmed) return;

			const result = await API.deleteDepartment(id)
			if (result.success){
                const indexpos = personnelStore.allDepartments.findIndex(
					dep => dep.dep_id === id
				)

				if (indexpos >= 0 ){
					personnelStore.allDepartments.splice(indexpos,1)
				}
            }
		}	catch (error) {
			console.error('Server error message:', error)
		}
	}

	const EditMode = ref(false)
	const isSubmitting = ref(false)
	const errorMessage = ref('')
	const isLoading = ref(false)

	onMounted(async ()=>{
		if (isLoading.value) return;
		isLoading.value = true
		if(personnelStore.allDepartments.length === 0){
			await personnelStore.populateDepartments()
		}
		isLoading.value = false;
	})
</script>
