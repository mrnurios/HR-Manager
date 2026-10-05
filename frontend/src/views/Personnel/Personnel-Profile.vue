<template>
    <div class="relative space-y-2 md:space-y-5 py-4">
        <div class="flex justify-between">
            <RouterLink 
                :to="{ name: 'home-personnel' }"
                class="hover:bg-zinc-900 p-2 inline-flex items-center rounded-lg border border-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>

                <span class="ml-2">Back</span>
            </RouterLink>

            <div class="flex gap-1">
                <button
                    @click="deletePersonnel()"
                    class="bg-red-300 hover:bg-red-400 text-zinc-950 font-semibold p-2 inline-flex cursor-pointer items-center rounded-lg border border-zinc-800">
                    <component :is="TrashIcon" class="size-6" stroke-width="1.5" />

                    <span class="ml-2">Delete</span>
                </button>
                <RouterLink
                    v-if="personnelStore.selectedPersonnel?.personnel_uuid"
                    :to="{
                        name: 'edit-personnel',
                        params: { id: uuid }
                    }"
                    class="bg-amber-200 hover:bg-amber-300 text-zinc-950 font-semibold p-2 inline-flex items-center rounded-lg border border-zinc-800">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>

                    <span class="ml-2">Edit</span>
                </RouterLink>
            </div>
        </div>

        <Card class="p-4 rounded-2xl space-y-4 max-w-3xl mx-auto relative overflow-clip">
			<dl class="flex flex-col gap-1">
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">First Name:</dt>
                    <dd class="font-semibold uppercase">{{ personnelStore.selectedPersonnel?.first_name || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Middle Name:</dt>
                    <dd class="font-semibold uppercase">{{ personnelStore.selectedPersonnel?.middle_name || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Last Name:</dt>
                    <dd class="font-semibold uppercase">{{ personnelStore.selectedPersonnel?.last_name || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Suffix:</dt>
                    <dd class="font-semibold uppercase">{{ personnelStore.selectedPersonnel?.ext_name || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Sex:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.sex || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Civil Status:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.civilstatus || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Birth Date:</dt>
                    <dd class="font-semibold capitalize">{{ tools.datetoStr(new Date(personnelStore.selectedPersonnel?.birthdate)).replace('Invalid Date', '—')}}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Address:</dt>
                    <dd class="font-semibold capitalize">{{ address || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Birth Place:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.birthplace || address || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-20 md:min-w-50 opacity-50 text-right">Additional Address:</dt>
                    <dd class="font-semibold capitalize">{{ (personnelStore.selectedPersonnel?.other_address)?.replace('|',', ') || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Mobile:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.contact_number || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Is PWD:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.is_pwd ? 'Yes' : 'No' || '—'}}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">PWD No.:</dt>
                    <dd class="font-semibold capitalize">{{ (personnelStore.selectedPersonnel?.pwd_id) || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Is Solo Parent:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.is_soloparent ? 'Yes' : 'No' || '—'}}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right">Solo Parent No.:</dt>
                    <dd class="font-semibold capitalize">{{ (personnelStore.selectedPersonnel?.solo_id) || '—' }}</dd>
                </div>

                <hr class="border-t border-slate-200/20 my-4" />

                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right whitespace-nowrap">Educational Attainment:</dt>
                    <dd class="font-semibold capitalize">{{ (personnelStore.selectedPersonnel?.educational_attainment)?.replace('|',', ') || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right whitespace-nowrap">Eligibility Level:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.eligibility_level || '—'}}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right whitespace-nowrap">Department:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.getDepartment(personnelStore.selectedPersonnel?.dep_id)?.dep_name || '—'}}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right whitespace-nowrap">Personnel Type:</dt>
                    <dd class="font-semibold capitalize">{{ personnelStore.selectedPersonnel?.personnel_type || '—' }}</dd>
                </div>
                <div class="flex gap-2 md:gap-6">
                    <dt class="min-w-30 md:min-w-50 opacity-50 text-right whitespace-nowrap">Appointments:</dt>
                    <dd class="font-semibold capitalize flex flex-col gap-1 my-1">
                        <template v-if="personnelStore.selectedPersonnel?.appointment_dates">
                            <span v-for="(datestr, index) in personnelStore.selectedPersonnel?.appointment_dates" :key="index"
                                class="rounded-full text-slate-800 px-2 text-xs shrink"
                                :class="index === personnelStore.selectedPersonnel?.appointment_dates.length-1  ? datestr[1] === ''? 'bg-green-300/60' : 'bg-red-800' : 'bg-slate-500'">
                                {{ `${tools.datetoStr(new Date(datestr[0]))} to ${datestr[1] ? tools.datetoStr(new Date(datestr[1])) : 'Present'}`}}
                            </span>
                        </template>
                        <span v-else>—</span>
                    </dd>
                </div>
            </dl>
        </Card>
    </div>
</template>

<script setup>
    import { useRoute,useRouter } from 'vue-router'
    import { ref,onMounted } from 'vue'
  	import Card from '../../components/Card.vue'
    import * as API from '../../services/api.js'
	import * as tools from '../../utils/format.js'
    import * as store from '../../stores/stores.js'
    import { 
        TrashIcon
    } from '@heroicons/vue/24/outline';

    const personnelStore = store.usePersonnelStore()

    const route = useRoute();
    const router = useRouter();
    const isLoading = ref(false);
    const errorMessage = ref('');
    const uuid = route.params.id;
    const address = ref('')
    onMounted(async () => {
        if (!personnelStore.selectedPersonnel) {
            try {
                isLoading.value = true;
                errorMessage.value = '';
                
                await personnelStore.selectPersonnel(uuid);
            } catch (error) {
                console.error('Database connection failed:', error);
                errorMessage.value = error.response?.data?.message || 'Could not connect to database server.';
            } finally {
                isLoading.value = false;
            }
        }

        address.value = `${personnelStore.selectedPersonnel.purok}, ${personnelStore.selectedPersonnel.barangay}`
    });

    async function deletePersonnel() {
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