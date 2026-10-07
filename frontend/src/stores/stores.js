import { defineStore } from 'pinia'
import { ref,computed } from 'vue'
import * as API from '../services/api.js'

export const usePersonnelStore = defineStore('personnel', () => {
    const allPersonnel = ref([])
    const selectedPersonnelId = ref(null)
    const selectedPersonnel = ref(null)
    const allDepartments = ref([])
    
    const selectPersonnel = async (personnel_uuid) => {
        selectedPersonnelId.value = personnel_uuid

        if (allPersonnel.value.length === 0) {
            const result = await API.getPersonnelByUUID(personnel_uuid)

            selectedPersonnel.value = result.data
        }else {
            selectedPersonnel.value = allPersonnel.value.find(
                person => person.personnel_uuid === personnel_uuid
            ) || null
        }
    }

    async function populatePersonnel(){
        const response = await API.getPersonnel()
        allPersonnel.value = [...response]
    }

    async function populateDepartments(){
        const response = await API.getAllDepartments()
        allDepartments.value = [...response]
    }

    const getDepartment = (id) => {
        if (allDepartments.value.length === 0){
            populateDepartments()
        }

        return allDepartments.value.find(
            ({ dep_id }) => dep_id === id
        )
    }

    async function deletePersonnel(uuid) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this personnel?'
        )

        if (!confirmed) return

        try {
            const result = await API.deletePersonnel(uuid)
            if (result.success) {
                const indexpos = allPersonnel.value.findIndex(
                    person => person.personnel_uuid === uuid
                )

                if (indexpos >= 0) {
                    allPersonnel.splice(indexpos, 1)
                }
            }
        } catch (error) {
            console.error('Database connection failed:', error)
        }
    }


    return {
        allDepartments,
        allPersonnel,
        selectedPersonnel,
        selectedPersonnelId,
        selectPersonnel,
        populatePersonnel,
        populateDepartments,
        getDepartment,
        deletePersonnel,
    }
})

export const usePassSlipStore = defineStore('pass-slip', () => {
    const selectedPassSlipEntry = ref(null)

    const selectPassSlipEntry = (Entry) => {
        selectedPassSlipEntry.value = Entry
    }

    return {
        selectedPassSlipEntry,
        selectPassSlipEntry
    }
})

export const useTravelEntryStore = defineStore('travel-entry', () => {
    const selectedTravelEntry = ref(null)

    const selectTravelEntry = (Entry) => {
        selectedTravelEntry.value = Entry
    }

    return {
        selectedTravelEntry,
        selectTravelEntry
    }
})