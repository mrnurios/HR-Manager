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

            selectedPersonnel.value = result

            return
        }

        selectedPersonnel.value = allPersonnel.value.find(
                person => person.personnel_uuid === personnel_uuid
            ) || null
    }

    async function populatePersonnel(){
        const response = await API.getPersonnel()
        allPersonnel.value = [...response]
    }

    async function populateDepartments(){
        const response = await API.getAllDepartments()
        allDepartments.value = [...response]
    }

    // async function getDepartment(id){
    //     if (allDepartments.value.length === 0){
    //         await populateDepartments()
    //     }

    //     allDepartments.value.forEach(({dep_id,dep_code,dep_name})=>{

    //     }) 

    //     return 
    // }

    const getDepartment = (id) => {
        if (allDepartments.value.length === 0){
            populateDepartments()
        }

        return allDepartments.value.find(
            ({ dep_id }) => dep_id === id
        )
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