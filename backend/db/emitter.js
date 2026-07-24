import { dbEvents } from './listener.js';

dbEvents.on('new_travel_entry', async (serialNo) => {
    console.log('New travel entry:', serialNo);
});