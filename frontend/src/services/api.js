import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    headers: {
        'Content-Type': 'application/json',
    }
})

// Optional: Automatically add bearer token if it exists in storage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('user_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api

export async function createPersonnel(data){
    const response = await api.post('/personnel/create', data)
    return response.data;
}

export async function createPersonnelEmploymentHistory(uuid,data){
    const response = await api.post(`/personnel/employment/create${uuid}`, data)
    return response.data;
}

export async function createDepartment(data){
    const response = await api.post('/department/create', data)
    return response.data;
}

export async function patchDepartment(id,data){
    const payload = {
        id,
        data: data
    };
    const response = await api.patch(`/department/${id}`, payload)
    return response.data;
}

export async function deleteDepartment(id){
    const response = await api.delete(`/department/${id}`)
    return response.data;
}

export async function getPersonnel() {
    const response = await api.get(`/personnel`);
    return response.data;
}

export async function getPersonnelByUUID(uuid) {
    const response = await api.get(`/personnel/${uuid}`);
    return response.data;
}

export async function searchPersonnel(query){
    const response = await api.get(`/personnel/search?q=${encodeURIComponent(query)}`);
    return response.data;
}

export async function deletePersonnel(uuid){
    const response = await api.delete(`/personnel/${uuid}`);
    return response.data;
}

export async function getPersonnelTravelEntriesandPassSlips(startDate,endDate){
    const response = await api.get(`/personnel/gettravelentriesandpassslips`, {
        params: { 
            startDate, 
            endDate 
        }
    });

    return response.data;
}

export async function patchPersonnelByUUID(uuid,data) {
    const response = await api.patch(`/personnel/${uuid}`, data);
    return response.data;
}

export async function patchPersonnelEmploymentHistory(id,data) {
    // console.log(id,data)
    const response = await api.patch(`/personnel/employment/${id}`, data);
    return response.data;
}

export async function getTravelEntries() {
    const response = await api.get(`/travel-entries`);
    return response.data;
}

export async function getTravelEntriesByPage(page) {
    const p = parseInt(page, 10) || 1;

    const response = await api.get(`/travel-entries/page/${p}`);
    return response.data;
}

export async function patchTravelEntry(travel_id,data){
    const payload = {
        data: data 
    };
    const response = await api.patch(`/travel-entries/patch/${travel_id}`, payload);
    return response.data;
}

export async function getTravelEntryBySerial(serial) {
    try {
        const response = await api.get(`/travel-entries/${serial}`);
        return response.data;
    } catch (error) {
        // FIX: Axios catches errors automatically, check error.response for status
        if (error.response && error.response.status === 404) {
            console.warn(`Record ${serial} does not exist in the system.`);
            return null; 
        }
        throw new Error(`Failed to load travel entry: Status ${error.response?.status || 'Unknown'}`);
    }
}

export async function createnewPassSlip(data){
    const response = await api.post(`/pass-slip/create`, data);
    return response.data;
}

export async function patchPassSlip(id,data){
    const response = await api.patch(`/pass-slip/${id}`, data);
    return response.data;
}

export async function getPassSlipsByPage(page) {
    const p = parseInt(page, 10) || 1;

    const response = await api.get(`/pass-slip/page/${p}`);
    return response.data;
}

export async function searchPassSlip(query, page){
    const p = parseInt(page, 10) || 1
    
    // FIX: Changed uppercase .GET to lowercase .get
    const response = await api.get(`/pass-slip/search?q=${encodeURIComponent(query)}&page=${p}`);
    // FIX: Assumes your API structure returns { data: [...] }. Adjust if it returns raw arrays.
    return response.data;
}

export async function getAllDepartments(){
    const response = await api.get(`/department`);
    return response.data;
}

export async function createnewTravel(data){
    const response = await api.post(`/travel-entries/create-travel`, data);
    return response.data;
}

export function listentravelStream(){
    return `/api/travel-stream`;
}

export async function searchTravel(query, page){
    const p = parseInt(page, 10) || 1

    // FIX: Changed uppercase .GET to lowercase .get
    const response = await api.get(`/travel-entries/search?q=${encodeURIComponent(query)}&page=${p}`);
    // FIX: Assumes your API structure returns { data: [...] }. Adjust if it returns raw arrays.
    return response.data;
}
