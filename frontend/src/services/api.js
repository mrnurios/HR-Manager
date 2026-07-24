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

export async function getTravelEntries() {
    const response = await api.get(`/travel-entries`);
    // FIX: Axios automatically extracts JSON and assigns it to .data
    return response.data;
}

export async function getTravelEntriesByPage(page) {
    const p = parseInt(page, 10) || 1;

    const response = await api.get(`/travel-entries/page/${p}`);
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

export async function getAllDepartments(){
    const response = await api.get(`/departments`);
    return response.data;
}

export async function createnewTravel(data){
    const response = await api.post(`/travel-entries/create-travel`, data);
    return response.data;
}

export async function updateTravelStatus(id,newstatus){
    const payload = {
            serial_no: id,
            status: newstatus
        };
    const response = await api.patch(`/travel-entries/update-travel/status`, payload);
    return response.data;
}

export async function updateTravel(data){
    // FIX: Changed uppercase .PUT to lowercase .put
    const response = await api.put(`/travel-entries/update-travel`, data);
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
