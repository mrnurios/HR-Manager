<script setup>
	import { ref,computed } from 'vue'
  	import FormSelect from '../components/FormDropdown.vue'
  	import Card from '../components/Card.vue'
  	import MsgBox from '../components/MsgBox.vue'
	import api from '../services/api.js'

	const isSubmitting = ref(false)
	const createProfile = async () => {
		if (isSubmitting.value) return
  		isSubmitting.value = true

		try {
			// No need to pass full URL or wrap payload in JSON.stringify
			const response = await api.post('/subjects/add', profile.value)
			if (response.data.success){
				clearProfile();
				feedbackmsg.value ='Profile Created Successfully!';
			}else{
				feedbackmsg.value = 'Error! Failed Creating Profile!'
			}
		} catch (error) {
			console.error('Server error message:', error)
			feedbackmsg.value = 'Error! Failed Creating Profile!'
		} finally {
			showfeedback.value = true;
			isSubmitting.value = false
		}
	}

	const profile =  ref({
		fname: '',
		mname: '',
		lname: '',
		ext: '',
		selectedGender: '',
		selectedCivilStatus: '',
		educationalattainment: '',
		birthdate: '',
		birthaddress: '',
		contact: '',
		disability: '',
		isGuardian: false,
		isPWD: false,
		selectedBarangay: '',
		selectedPurok: '',
		specifyPurok: '',
		additionaladd: '',
		guardian: '',
	})

	const clearProfile = () => {
		profile.value = {
			fname: '',
			mname: '',
			lname: '',
			ext: '',
			selectedGender: '',
			selectedCivilStatus: '',
			educationalattainment: '',
			birthdate: '',
			birthaddress: '',
			contact: '',
			disability: '',
			isGuardian: false,
			isPWD: false,
			selectedBarangay: '',
			selectedPurok: '',
			specifyPurok: '',
			additionaladd: '',
			guardian: '',
		};
	};

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
			puroks:[]
		},
		{
			name:"Calangahan",
			puroks:[]
		},
		{
			name:"Kaluknayan",
			puroks:['Purok 1 A-B Comonal','Purok 2 A-B Maki-Angayon','Purok 3', 'Purok 4 A-B Tangison']
		},
		{
			name:"Lower Talacogon",
			puroks:[]
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
		return found ? found.puroks : [];
	});

	const handleBarangayChange = () => {
		profile.value.selectedPurok = '';
	};

	const birthdate = ref('')
	const isMinor = computed(() => {
		if (!profile.value.birthdate) return false
		
		const birthDateObj = new Date(profile.value.birthdate)
		const today = new Date()
		
		// Calculate basic year difference
		let age = today.getFullYear() - birthDateObj.getFullYear()
		
		// Adjust age if the birthday hasn't occurred yet this current year
		const monthDifference = today.getMonth() - birthDateObj.getMonth()
		const dayDifference = today.getDate() - birthDateObj.getDate()
		
		if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
			age--
		}
		
		if (age < 18) {
      		profile.value.selectedCivilStatus = 'single'; 
		}

		return age < 18
	})

	const feedbackmsg = ref('Subject Profile Created Successfully!')
	const handleParentAction = () => showfeedback.value = false;
	const showfeedback = ref(false)
</script>

<template>
	<div class="relative space-y-5">
		<RouterLink 
			:to="{ name: 'home-personnel' }"
			class="hover:bg-zinc-900 p-4 inline-flex items-center rounded-xl border border-zinc-800">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
			</svg>

			<span class="ml-2">Back</span>
		</RouterLink>

		<Card class="p-8 rounded-4xl space-y-4 max-w-5xl mx-auto relative overflow-clip">
			<span class="font-bold text-2xl">Add Subjects</span>
			<span class="block opacity-45 text-lg">Register and add new personal information.</span>
			<form @submit.prevent="createProfile" class="flex flex-col gap-3">
				<div class="flex gap-3 flex-wrap">
					<div>
						<label for="first-name" class="font-bold text-sm opacity-45 ml-3">FIRST NAME</label>
						<input
							id="first-name"
							v-model="profile.fname"
							autocomplete="given-name" 
							required
							placeholder="e.g. Juan"
							class="block form-input-style"/>
					</div>

					<div>
						<label for="middle-name" class="font-bold text-sm opacity-45 ml-3">MIDDLE NAME</label>
						<input 
							id="middle-name"
							v-model="profile.mname"
							autocomplete="additional-name" 
							placeholder="e.g. Ybañez"
							class="block form-input-style"/>
					</div>

					<div>
						<label for="last-name" class="font-bold text-sm opacity-45 ml-3">LAST NAME</label>
						<input 
							id="last-name"
							v-model="profile.lname"
							autocomplete="family-name"
							required
							placeholder="e.g. Dela Cruz"
							class="block form-input-style"/>
					</div>

					<div>
						<label for="extension" class="font-bold text-sm opacity-45 ml-3">EXT</label>
						<input 
							id="extension"
							v-model="profile.ext"
							autocomplete="honorific-suffix"
							placeholder="e.g. Jr"
							class="block form-input-style w-20"/>
					</div>
					<div>
						<label for="gender" class="font-bold text-sm opacity-45 ml-3">SEX</label>
						<FormSelect id="gender" v-model="profile.selectedGender">
							<option value="" disabled selected>Select sex</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</FormSelect>
					</div>
				</div>
				<hr class="border-t border-slate-200/20 my-4" />
				<div class="flex gap-3 flex-wrap">
					<div>
						<label for="birthdate" class="font-bold text-sm opacity-45 ml-3">BIRTHDATE</label>
						<input
							id="birthdate"
							v-model="profile.birthdate" 
							type="date"
							required
							class="block form-input-style
									scheme-dark
									[&::-webkit-calendar-picker-indicator]:cursor-pointer
									[&::-webkit-calendar-picker-indicator]:opacity-80"
						/>
					</div>
					<div>
						<label for="civil-status" class="font-bold text-sm opacity-45 ml-3">CIVIL STATUS</label>
						<FormSelect id="civil-status" v-model="profile.selectedCivilStatus" :is-required=true >
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
						<FormSelect id="educational-attainment" v-model="profile.educationalattainment" :is-required=true>
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
						<input id="contact" v-model="profile.contact" placeholder="e.g. 09171234567" name="contact" autocomplete="tel-local" pattern="[0-9+ ]*" class="block form-input-style" required/>
					</div>
				</div>
				<hr class="border-t border-slate-200/20 my-4" />
				<div class="flex flex-col w-full flex-wrap gap-3">
					<label>
						<span class="font-bold text-sm opacity-45 ml-3">
							ADDRESS
						</span>
						<div class="flex gap-2">
							<FormSelect id="barangay" v-model="profile.selectedBarangay" :is-required=true @change="handleBarangayChange">
								<option value="" disabled selected>Select Barangay</option>
								<option v-for="b in barangaylist" :key="b.name" :value="b.name">
									{{ b.name }}
								</option>
							</FormSelect>
							<FormSelect id="purok" v-model="profile.selectedPurok" :is-required=true :disabled="!profile.selectedBarangay" class="disabled:opacity-50"">
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
							<input v-if="profile.selectedPurok === 'Other'" v-model="profile.specifyPurok" class="form-input-style w-full" placeholder="Specify purok" required/>
							<input type="Text" id="additionaladd" v-model="profile.additionaladd" placeholder="(Optional) Additional info e.g. building no." class="form-input-style w-full"/>
						</div>
					</label>
					<div class="flex flex-col flex-1">
						<label for="birthaddress" class="font-bold text-sm opacity-45 ml-3">PLACE OF BIRTH</label>
						<input
							type="text"
							id="birthaddress"
							placeholder="e.g. Brgy. Poblacion, Lugait"
							v-model="profile.birthaddress"
							required
							class="block form-input-style min-w-80"/>
					</div>
				</div>
				<hr class="border-t border-slate-200/20 my-4" />
				<div class="flex gap-3 flex-wrap">
					<label>
						<span class="font-bold text-sm opacity-45 ml-3">
							IS PWD?
						</span>
						<div class="flex">
							<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border  p-4 rounded-l-full"
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
						<label for="disability" class="font-bold text-sm opacity-45 ml-3">Disability</label>
						<input id="disability" v-model="profile.disability" class="block form-input-style" required placeholder="Specify disability"/>
					</div>
					<div v-if="profile.isPWD || isMinor">
						<label for="guardian" class="font-bold text-sm opacity-45 ml-3">GUARDIAN</label>
						<input id="guardian" v-model="profile.guardian" type="text" class="block form-input-style" required placeholder="e.g. Juana Dela Cruz"/>
					</div>
					<label v-if="profile.birthdate && !isMinor">
						<span class="font-bold text-sm opacity-45 ml-3">
							IS GUARDIAN?
						</span>
						<div class="flex">
							<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border  p-4 rounded-l-full"
								:class="profile.isGuardian ? 'bg-amber-300/10 border-amber-300/30 focus-within:border-amber-300 hover:bg-amber-300/20' : 'bg-zinc-900 border-slate-300/5 hover:bg-zinc-800'">
								<input
									type="radio" 
									id="pwd-yes" 
									name="pwd-group"
									v-model="profile.isGuardian"
									:value="true"
									class="sr-only"
								/>
								<span class="text-sm text-slate-300">Yes</span>
							</label>
							<label class="flex w-18 items-center justify-center gap-2 cursor-pointer border rounded-r-full"
								:class="!profile.isGuardian ? 'bg-amber-300/10 border-amber-300/30 focus-within:border-amber-300 hover:bg-amber-300/20' : 'bg-zinc-900 border-slate-300/5 hover:bg-zinc-800'">
								<input
									type="radio"
									id="pwd-yes"
									name="pwd-group"
									v-model="profile.isGuardian"
									:value="false"
									class="sr-only"
								/>
								<span class="text-sm text-slate-300">No</span>
							</label>
						</div>
					</label>
				</div>
				
				<button :disabled="isSubmitting" type="submit" class="w-40 h-15 ml-auto bg-zinc-800 border border-slate-200/15 hover:bg-zinc-400/50 rounded-2xl cursor-pointer">Submit</button>
			</form>
			<div v-if="showfeedback" class="absolute inset-0 w-full h-full backdrop-blur-md bg-zinc-900/10 flex items-center">
				<MsgBox class="bg-zinc-900 mx-auto h-50" :message="feedbackmsg" @click="handleParentAction" />
			</div>
		</Card>
	</div>
</template>