<template>
	<div class="relative space-y-2 gap-y-2 py-4">
		<button 
			@click="router.back"
			class="hover:bg-zinc-900 p-2 inline-flex items-center rounded-lg border border-zinc-800">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
			</svg>

			<span class="ml-2">Back</span>
		</button>

		<Card class="p-4 md:p-6 rounded-2xl space-y-4 max-w-5xl mx-auto relative overflow-clip">
			<span class="font-bold text-2xl">{{ EditMode ? 'Edit Personnel' : 'Add Personnel' }}</span>
			<span class="block opacity-45 text-lg">{{ EditMode ? 'Update personnel personal information.':'Register and add new personal information.'}} </span>
			<form @submit.prevent="EditMode ? updateProfile() : createProfile()" class="flex flex-col gap-3">
				<div class="flex flex-wrap gap-1 md:gap-3">
					<div>
						<label for="first-name" class="font-bold text-sm opacity-45 ml-3">FIRST NAME</label>
						<input
							id="first-name"
							v-model="profile.fname"
							autocomplete="given-name" 
							required
							placeholder="e.g. Juan"
							class="block form-input-style uppercase"/>
					</div>

					<div>
						<label for="middle-name" class="font-bold text-sm opacity-45 ml-3">MIDDLE NAME</label>
						<input 
							id="middle-name"
							v-model="profile.mname"
							autocomplete="additional-name" 
							placeholder="e.g. Ybañez"
							class="block form-input-style uppercase"/>
					</div>

					<div>
						<label for="last-name" class="font-bold text-sm opacity-45 ml-3">LAST NAME</label>
						<input 
							id="last-name"
							v-model="profile.lname"
							autocomplete="family-name"
							required
							placeholder="e.g. Dela Cruz"
							class="block form-input-style uppercase"/>
					</div>

					<div>
						<label for="extension" class="font-bold text-sm opacity-45 ml-3">EXT</label>
						<input 
							id="extension"
							v-model="profile.ext"
							autocomplete="honorific-suffix"
							placeholder="e.g. Jr"
							class="block form-input-style w-20 uppercase"/>
					</div>

					<div>
						<label for="gender" class="font-bold text-sm opacity-45 ml-3">SEX</label>
						<FormSelect id="gender" :is-required=true v-model="profile.selectedGender">
							<option value="" disabled selected>Select sex</option>
							<option value="male">MALE</option>
							<option value="female">FEMALE</option>
						</FormSelect>
					</div>

					<div>
						<label for="birthdate" class="font-bold text-sm opacity-45 ml-3">BIRTHDATE</label>
						<input
							id="birthdate"
							v-model="profile.birthdate" 
							type="date"
							class="uppercase block form-input-style
									scheme-dark
									[&::-webkit-calendar-picker-indicator]:cursor-pointer
									[&::-webkit-calendar-picker-indicator]:opacity-80"
						/>
					</div>
				</div>

				<hr class="border-t border-slate-200/20 my-4" />

				<div class="flex flex-col w-full flex-wrap gap-3">
					<label>
						<span class="font-bold text-sm opacity-45 ml-3">
							ADDRESS
						</span>
						<div class="flex flex-wrap gap-2">
							<FormSelect id="barangay" v-model="profile.selectedBarangay" @change="handleBarangayChange" class="uppercase">
								<option value="" disabled selected>Select Barangay</option>
								<option v-for="b in barangaylist" :key="b.name" :value="b.name">
									{{ b.name }}
								</option>
							</FormSelect>
							<FormSelect id="purok" v-model="profile.selectedPurok" :disabled="!profile.selectedBarangay" class="uppercase disabled:opacity-50">
								<option value="" disabled selected>
									Select Purok
								</option>
								<option v-for="(purok,index) in availablePuroks" :key="index" :value="purok">
									{{ purok }}
								</option>
								<option value="Other">
									Other...
								</option>
							</FormSelect>
							<input v-if="profile.selectedPurok === 'Other'" v-model="profile.specifyPurok" class="form-input-style w-full" placeholder="Specify purok"/>
							<input type="Text" id="additionaladd" v-model="profile.additionaladd" placeholder="(Optional) Additional info e.g. building no." class="form-input-style w-full uppercase"/>
						</div>
					</label>
					<div class="flex flex-col flex-1">
						<label for="birthaddress" class="font-bold text-sm opacity-45 ml-3">PLACE OF BIRTH</label>
						<div class="flex flex-wrap gap-3">
							<label class="inline-flex items-center cursor-pointer gap-2">
								<input
									type="checkbox"
									v-model="sameAddress"
									class="peer sr-only"
								>

								<div
									class="size-6 rounded border border-slate-200/15
										peer-checked:bg-amber-200
										peer-checked:border-amber-200
										peer-cd hover:bg-amber-200
										flex items-center justify-center
										transition-colors"
								>	
									<svg v-if="sameAddress" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="stroke-3 size-4 text-zinc-900">
										<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
									</svg>
								</div>
								<span class="whitespace-nowrap">Same as Address</span>
							</label>
							<input
								type="text"
								:disabled="sameAddress"
								id="birthaddress"
								placeholder="e.g. Brgy. Poblacion, Lugait"
								v-model="profile.birthaddress"
								class="block w-full form-input-style uppercase disabled:opacity-50 disabled:text-transparent"/>
						</div>
					</div>
				</div>
				<hr class="border-t border-slate-200/20 my-4" />
				<div class="flex gap-3 flex-wrap">
					<div>
						<label for="civil-status" class="font-bold text-sm opacity-45 ml-3 uppercase">CIVIL STATUS</label>
						<FormSelect id="civil-status" v-model="profile.selectedCivilStatus" class="uppercase">
							<option value="" disabled selected>Select status</option>
							<option value="single">Single</option>
							<option value="married">Married</option>
							<option value="widowed">Widowed</option>
							<option value="cohabiting">Cohabiting</option>
							<option value="legalseparation">Legal Separation</option>
							<option value="annulled">Annulled</option>
						</FormSelect>
					</div>
					<div>
						<label for="educational-attainment" class="font-bold text-sm opacity-45 ml-3">EDUCATIONAL ATTAINMENT</label>
						<FormSelect id="educational-attainment" v-model="profile.educationalattainment" class="uppercase text-wrap w-full">
							<option value="" disabled selected>Select education attainment</option>
							<option value="none">No Formal Education</option>
							<option value="elem_undergrad">Elementary Undergraduate</option>
							<option value="elem_grad">Elementary Graduate</option>
							<option value="jhs_undergrad">Junior High School / High School Undergraduate</option>
							<option value="hs_grad_old">High School Graduate (Old Curriculum)</option>
							<option value="shs_grad">Senior High School Graduate</option>
							<option value="tech_voc">Tech-Voc Graduate (TESDA)</option>
							<option value="college_undergrad">College Undergraduate</option>
							<option value="bachelors">Bachelor's Degree (College Graduate)</option>
							<option value="masters">Master's Degree</option>
							<option value="doctorate">Doctorate Degree (Ph.D.)</option>
						</FormSelect>
					</div>
					<div>
						<label for="contact" class="font-bold text-sm opacity-45 ml-3">CONTACT #</label>
						<input id="contact" v-model="profile.contact" placeholder="e.g. 09171234567" name="contact" autocomplete="tel-local" pattern="[0-9+ ]*" class="block form-input-style"/>
					</div>
					<div class="flex flex-wrap gap-3">
						<label>
							<span class="font-bold text-sm opacity-45 ml-3">
								IS PWD?
							</span>
							<div class="flex">
								<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border p-2 rounded-l-full"
									:class="profile.isPWD ? 'bg-amber-300/10 border-amber-300/30 focus-within:border-amber-300 hover:bg-amber-300/20' : 'bg-zinc-900 border-slate-300/5 hover:bg-zinc-800'">
									<input
										type="radio" 
										id="pwd-yes" 
										name="pwd-group"
										v-model="profile.isPWD"
										:value="true"
										class="sr-only"
									/>
									<span class="text-sm text-slate-300">Yes</span>
								</label>
								<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border rounded-r-full"
									:class="!profile.isPWD ? 'bg-amber-300/10 border-amber-300/30 focus-within:border-amber-300 hover:bg-amber-300/20' : 'bg-zinc-900 border-slate-300/5 hover:bg-zinc-800'">
									<input
										type="radio"
										id="pwd-yes"
										name="pwd-group"
										v-model="profile.isPWD"
										:value="false"
										class="sr-only"
									/>
									<span class="text-sm text-slate-300">No</span>
								</label>
							</div>
						</label>
						<div v-if="profile.isPWD">
							<label for="pwdnumber" class="font-bold text-sm opacity-45 ml-3">PWD ID No.</label>
							<input id="pwdnumber" v-model="profile.PWDID" class="block form-input-style uppercase" required placeholder="ID No..."/>
						</div>
					</div>
					<div class="flex flex-wrap gap-3">
						<label >
							<span class="font-bold text-sm opacity-45 ml-3">
								IS SOLO PARENT?
							</span>
							<div class="flex">
								<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border p-2 rounded-l-full"
									:class="profile.isSoloParent ? 'bg-amber-300/10 border-amber-300/30 focus-within:border-amber-300 hover:bg-amber-300/20' : 'bg-zinc-900 border-slate-300/5 hover:bg-zinc-800'">
									<input
										type="radio" 
										id="soloparent-yes" 
										name="soloparent-group"
										v-model="profile.isSoloParent"
										:value="true"
										class="sr-only"
									/>
									<span class="text-sm text-slate-300">Yes</span>
								</label>
								<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border rounded-r-full"
									:class="!profile.isSoloParent ? 'bg-amber-300/10 border-amber-300/30 focus-within:border-amber-300 hover:bg-amber-300/20' : 'bg-zinc-900 border-slate-300/5 hover:bg-zinc-800'">
									<input
										type="radio"
										id="soloparent-yes"
										name="soloparent-group"
										v-model="profile.isSoloParent"
										:value="false"
										class="sr-only"
									/>
									<span class="text-sm text-slate-300">No</span>
								</label>
							</div>
						</label>
						<div v-if="profile.isSoloParent">
							<label for="soloparentnumber" class="font-bold text-sm opacity-45 ml-3">Solo Parent ID No.</label>
							<input id="soloparentnumber" v-model="profile.SoloParentID" class="uppercase block form-input-style" required placeholder="ID No..."/>
						</div>
					</div>
				</div>
				<hr class="border-t border-slate-200/20 my-4" />
				<div class="flex gap-3 flex-wrap">
					<div>
						<label for="eligibility" class="font-bold text-sm opacity-45 ml-3">ELIGIBILITY LEVEL</label>
		
						<FormSelect id="eligibility" v-model="profile.eligibility" class="uppercase">
							<option value="" disabled selected>Select eligibility level</option>
							<option value="none">No eligibility</option>
							<option value="subprofessional">1st level eligibility - Subprofessional</option>
							<option value="professional">2nd level eligibity - Professional</option>
							<option value="executive">3rd level eligibity - Executive</option>
						</FormSelect>
					</div>
					<div class="mx-auto min-w-0 p-4 border border-slate-200/15 overflow-clip rounded-2xl">
						<div class="min-h-20 max-w-full flex flex-col items-center overflow-auto">
							<span class="font-bold text-sm opacity-45">APPOINTMENTS</span>
							<table class="border-separate border-spacing-y-1 w-full">
								<thead>
									<tr>
										<th class="w-5">No.</th>
										<th class="w-60 text-center text-sm">START</th>
										<th class="w-60 text-center text-sm">END</th>
										<th class="text-center text-sm">Type</th>
										<th class="text-center text-sm">Department</th>
										<th class="w-60 text-center text-sm">Position</th>
									</tr>
								</thead>
								<tbody>
									<template v-for="(employment,index) in EmploymentHistory" :key="index">
										<tr>
											<td>
												{{ index + 1 }}.
											</td>
											<td class="text-center px-1 h-15">
												<input required type="date" v-model="employment.appointment_date.start"
													class="form-input-style
													scheme-dark w-full
													[&::-webkit-calendar-picker-indicator]:cursor-pointer
													[&::-webkit-calendar-picker-indicator]:opacity-80"/>
											</td>
											<td class="text-center px-1 h-15">
												<input type="date" v-model="employment.appointment_date.end"
													class="form-input-style w-full
													scheme-dark
													[&::-webkit-calendar-picker-indicator]:cursor-pointer
													[&::-webkit-calendar-picker-indicator]:opacity-80"/>
											</td>
											<td class="text-center px-1 h-15">
												<div class="relative w-fit">
													<select 
														required
														class="block form-input-style appearance-none pr-8 cursor-pointer"
														v-model="employment.job_type"
														id="perconnel_type"
													>
														<option value="" disabled>Select type</option>
														<option value="joborder">Job Order</option>
														<option value="permanent">Permanent</option>
														<option value="elective">Elective</option>
														<option value="coterminous">Coterminous</option>
													</select>
													<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
														<svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
															<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
														</svg>
													</div>
												</div>
											</td>
											<td class="text-center px-1 h-15">
												<div class="relative w-fit">
													<select 
														required
														class="block form-input-style appearance-none pr-8 cursor-pointer"
														v-model="employment.dep_id"
														id="department"
													>
														<option value="" disabled>Select Department</option>
														<option v-for="d in personnelStore.allDepartments" :key="d.dep_id" :value="Number(d.dep_id)">
															{{ d.dep_code }}
														</option>
													</select>
													<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
														<svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
															<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
														</svg>
													</div>
												</div>
											</td>
											<td class="text-center px-1 h-15">
												<input required type="text" v-model="employment.job_position"
													placeholder="Input position..."
													class="form-input-style w-full
													scheme-dark
													[&::-webkit-calendar-picker-indicator]:cursor-pointer
													[&::-webkit-calendar-picker-indicator]:opacity-80"
													@input="employment.job_position = $event.target.value === '' ? null : $event.target.value"/>
											</td>
											<td class="flex justify-center items-center h-15">
												<button type="button" 
													title="Delete"
													@click="EmploymentHistory.splice(index, 1)"
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
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td class="flex justify-center items-center h-15">
											<button type="button"
												@click="EmploymentHistory.push(
													{
														appointment_date:{start: '',end: ''},
														job_type:'',
														dep_id:'',
														job_position:''
													}
												)"
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
				</div>
				<div class="ml-auto gap-3 flex">
					<button v-if="EditMode" 
						:disabled="isSubmitting"
						type="button"
						@click="router.back()"
						class="disabled:opacity-50 enabled:active:scale-95 w-40 h-15 bg-zinc-800 border border-slate-200/15 enabled:hover:bg-zinc-400/50 rounded-2xl enabled:cursor-pointer">
						Cancel
					</button>
					<button :disabled="!EnableUpdate" type="submit" class="disabled:opacity-50 w-40 h-15 bg-zinc-800 border border-slate-200/15 enabled:hover:bg-zinc-400/50 rounded-2xl enabled:cursor-pointer enabled:active:scale-95">{{ EditMode ? 'Save Update' : 'Submit' }}</button>
				</div>
			</form>
			<div v-if="showfeedback" class="absolute inset-0 w-full h-full backdrop-blur-md bg-zinc-900/10 flex items-center">
				<MsgBox class="bg-zinc-900 mx-auto h-50" :message="feedbackmsg" @click="handleParentAction" />
			</div>
		</Card>
	</div>
</template>

<script setup>
	import { ref,computed,watch,onMounted,toRaw,reactive } from 'vue'
	import { useRoute,useRouter } from 'vue-router';
  	import FormSelect from '../../components/FormDropdown.vue'
  	import Card from '../../components/Card.vue'
  	import MsgBox from '../../components/MsgBox.vue'
	import * as API from '../../services/api.js'
    import { usePersonnelStore } from '../../stores/stores.js'
	import * as tools from '../../utils/format.js'
	
	const dirtyFieldsArray = computed(() => {
		const dirty = reactive([])

		watch(
			EmploymentHistory,
			() => {
				dirty.length = 0

				if (!originalEmploymentHistory.value) return

				EmploymentHistory.value.forEach((item, index) => {
					const fields = {}
					for (const key in fields) {
						delete fields[key]
					}

					for (const key in item) {
						if (
							JSON.stringify(item[key]) !==
							JSON.stringify(originalEmploymentHistory.value[index][key])
						) {
							fields[key] = item[key]
						}
					}

					if (Object.keys(fields).length > 0) {
						fields.id = originalEmploymentHistory.value[index].id
						dirty.push(fields)
					}
				})

			},
			{ deep: true, immediate: true }
		)

		return dirty
	})

	const route = useRoute();
	const router = useRouter()

	const ErrorOccured = ref(false);
	const EditMode = ref(false);
	const profileInfo = ref({})
	const originalProfile = ref({})
	const originalEmploymentHistory = ref({})
	const personnelStore = usePersonnelStore()

	onMounted(async () => {
		try {

			if (personnelStore.allDepartments.length === 0){
				await personnelStore.populateDepartments()
			}

			if (route.name === 'edit-personnel' && route.params.id){
				EditMode.value = true;
				isSubmitting.value = true;

				await personnelStore.selectPersonnel(route.params.id);

				profileInfo.value = {...personnelStore.selectedPersonnel}

				let localBirthDate = ''
				if (profileInfo.value.birthdate){
					const date = new Date(profileInfo.value.birthdate);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					localBirthDate = `${year}-${month}-${day}`;
				}

				profile.value = {
					fname: profileInfo.value.first_name,
					mname: profileInfo.value.middle_name,
					lname: profileInfo.value.last_name,
					ext: profileInfo.value.ext_name,
					selectedGender: profileInfo.value.sex,
					selectedCivilStatus: profileInfo.value.civilstatus,
					educationalattainment: profileInfo.value.educational_attainment,
					birthdate: localBirthDate,
					birthaddress: profileInfo.value.birthplace,
					contact: profileInfo.value.contact_number,
					isPWD: profileInfo.value.is_pwd,
					PWDID: profileInfo.value.pwd_id,
					isSoloParent: profileInfo.value.is_soloparent,
					SoloParentID: profileInfo.value.solo_id,
					selectedBarangay: profileInfo.value.barangay,
					selectedPurok: profileInfo.value.purok,
					specifyPurok: profileInfo.value.other_purok || '',
					additionaladd: profileInfo.value.other_address,
					eligibility: profileInfo.value.eligibility_level
				};

				originalEmploymentHistory.value = profileInfo.value.employment_history.map(history => {
											const [start, end] = history.appointment_date

											return {
												...history,
												appointment_date: { start, end }
											}
										})

				EmploymentHistory.value = profileInfo.value.employment_history.map(history => {
											const [start, end] = history.appointment_date

											return {
												...history,
												appointment_date: { start, end }
											}
										})
				

				sameAddress.value = (profile.value.birthaddress === '')

				originalEmploymentHistory.value = JSON.parse(
					JSON.stringify(EmploymentHistory.value)
				)

				originalProfile.value = JSON.parse(
					JSON.stringify(toRaw(profile.value))
				)

				isSubmitting.value = false;
			}
		}catch (error) {
			console.error('Server error message:', error)
			router.push({
				name: 'home-personnel'
			})
		}
	})

	const isSubmitting = ref(false)
	const createProfile = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true
		ErrorOccured.value = false;
		
		try {
			// console.log(EmploymentHistory.value)
			// No need to pass full URL or wrap payload in JSON.stringify
			const response = await API.createPersonnel(profile.value);
			if (response.success){
				if (EmploymentHistory.value.length > 0) {
					const currentuuid = response.data.personnel_uuid
					try {
						const empresponse = await Promise.all(
							EmploymentHistory.value.map(fields => {
								if (
									fields.appointment_date.start === "" &&
									fields.appointment_date.end === "" && 
									(fields.job_position === "" || fields.job_position === null) &&
									(fields.job_type === "" || fields.job_type === null) &&
									fields.dep_id === null
								) return

								return API.createPersonnelEmploymentHistory(currentuuid, fields)
							})
						)
						if (empresponse.every(emp => emp.success)){
							clearProfile();
						}else{
							feedbackmsg.value = 'Error! Failed To Create Employment History!'
							showfeedback.value = true;
							router.push({
								name: 'edit-personnel',
								params: { id: `${currentuuid}`}
							})
						}
					}catch{
						feedbackmsg.value = 'Error! Failed To Create Employment History!'
						showfeedback.value = true;
						router.push({
							name: 'edit-personnel',
							params: { id: `${currentuuid}`}
						})
					}
				}
			}else{
				feedbackmsg.value = 'Error! Failed Creating Profile!'
			}
			feedbackmsg.value ='Profile Created Successfully!';
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = `Error! Failed Creating Profile!\n${error.response?.data?.message}`
			ErrorOccured.value = true;
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}

	const updateProfile = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true
		ErrorOccured.value = false;

		try {
			if (Object.keys(dirtyFields).length > 0) {
					if (sameAddress.value){
					const birthadd = []
					if (profile.value.selectedPurok === 'Other') {
						birthadd.push(profile.value.specifyPurok.trim())
					}else{
						birthadd.push(profile.value.selectedPurok.trim())
					}
					birthadd.push(profile.value.selectedBarangay)
					birthadd.push('Lugait, Misamis Oriental')
					profile.value.birthaddress = birthadd.join(', ')
				}

				const response = await API.patchPersonnelByUUID(personnelStore.selectedPersonnel.personnel_uuid,JSON.parse(JSON.stringify(dirtyFields)));
				
				if (response.success){
					feedbackmsg.value = 'Profile Updated Successfully!';
					personnelStore.selectedPersonnel = response.data[0]
					const indexpos = personnelStore.allPersonnel.findIndex(
						person => person.personnel_uuid === personnelStore.selectedPersonnel.personnel_uuid
					)

					if (indexpos >= 0 ){
						personnelStore.allPersonnel[indexpos] = response.data.rows[0]
					}
				}else{
					feedbackmsg.value = 'Error! Failed Updating Profile!'
				}
			}
			
			if( dirtyFieldsArray.value.length > 0) {
				const values = JSON.parse(JSON.stringify(dirtyFieldsArray.value))
				const response = await Promise.all(
					values.map(fields => {
						const id = fields.id
						delete fields.id

						return API.patchPersonnelEmploymentHistory(id, fields)
					})
				)

				response.forEach(query => {
					if (query.success){
						const indexpos = personnelStore.allPersonnel.findIndex(
							person => person.personnel_uuid === personnelStore.selectedPersonnel.personnel_uuid
						)

						if (indexpos >= 0 ){
							personnelStore.allPersonnel[indexpos].employment_history = query.data
						}
					}
				})
			}
		} catch (error) {
			console.error('Server error message:', error.response?.data?.message)
			feedbackmsg.value = `Error! Failed Updating Profile!\n${error.response?.data?.message}`
			ErrorOccured.value = true;
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false;
		}
	}

	function validateAppointmentDates(){
		return profile.value.appointmentdates.every(({ start, end }, index) => {
			if (index === 0) {
				return start.trim() !== ''
			}

			return start.trim() !== '' && end.trim() !== ''
		})
	};

	const EmploymentHistory = ref([])

	const profile = ref({
		fname: null,
		mname: null,
		lname: null,
		ext: null,
		selectedGender: null,
		selectedCivilStatus: null,
		educationalattainment: null,
		birthdate: null,
		birthaddress: null,
		contact: null,
		isPWD: false,
		PWDID: null,
		isSoloParent: false,
		SoloParentID: null,
		selectedBarangay: null,
		selectedPurok: null,
		specifyPurok: null,
		additionaladd: null,
		eligibility: null
	})

	const clearProfile = () => {
		EmploymentHistory.value = []

		profile.value = {
			fname: null,
			mname: null,
			lname: null,
			ext: null,
			selectedGender: null,
			selectedCivilStatus: null,
			educationalattainment: null,
			birthdate: null,
			birthaddress: null,
			contact: null,
			isPWD: false,
			PWDID: null,
			isSoloParent: false,
			SoloParentID: null,
			selectedBarangay: null,
			selectedPurok: null,
			specifyPurok: null,
			additionaladd: null,
			eligibility: null
		};
	};

	const sameAddress = ref(false);

	const barangaylist = ref([
		{
			name:"Aya-Aya",
			puroks:[]
		},
		{
			name:"Betahon",
			puroks:[]
		},
		{
			name:"Biga",
			puroks:['Purok 3']
		},
		{
			name:"Calangahan",
			puroks:['Buhagay','Masidlakon','Malipayon','Sampaguita-A','Sampaguita-B','Mahayahay','Mahusay']
		},
		{
			name:"Kaluknayan",
			puroks:['Purok 1 A-B Comonal','Purok 2 A-B Maki-Angayon','Purok 3', 'Purok 4 A-B Tangison']
		},
		{
			name:"Lower Talacogon",
			puroks:['Gumamela']
		},
		{
			name:"Poblacion",
			puroks:['Bonifacio','Mabini','Macao','Mauswagon','Masilakon 1','Masilakon 2','Rizal','Salimbal']
		},
		{
			name:"Upper Talacogon",
			puroks:['Masilakon','Madasigon','Bliss','San Roque','Pag-Asa','Cabo-Cabo','Taal']
		},
	]);

	const availablePuroks = computed(() => {
		if (!profile.value.selectedBarangay) return [];
		const found = barangaylist.value.find(b => b.name === profile.value.selectedBarangay);
		return found ? found.puroks.sort() : [];
	});

	const handleBarangayChange = () => {
		profile.value.selectedPurok = '';
	};

	const dirtyFields = tools.dirtyFields(profile,originalProfile)

	const feedbackmsg = ref('Subject Profile Created Successfully!')
	const handleParentAction = () => {
		showfeedback.value = false
		if (!ErrorOccured.value){
			if (EditMode.value){
				router.push({
					name: 'view-personnel',
					params: { id: route.params.id }
				})
			}else{
				router.push({
					name: 'home-personnel'
				})
			}
		}
	};
	const showfeedback = ref(false)

	const EnableUpdate = computed(()=>{
		return Object.keys(dirtyFields).length > 0 || dirtyFieldsArray.value.length > 0 || !isSubmitting
	})
</script>