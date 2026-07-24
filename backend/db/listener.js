import { listener } from './db.js';
import { EventEmitter } from 'events';
import { clients } from '../server.js';

export async function startListener() {
    await listener.connect();

    await listener.query('LISTEN new_travel_entry');

    console.log('Listening for new_travel_entry...');

    listener.on('notification', (msg) => {
        console.log('Channel:', msg.channel);
        console.log('Serial No:', msg.payload);
        dbEvents.emit('new_travel_entry', msg.payload);

        clients.forEach(client => {
            // SSE formatting requires text to begin strictly with "data: " and end with two newlines
            client.write(`data: ${JSON.stringify({ serial_no: msg.payload })}\n\n`);
        });
    });

    listener.on('error', (err) => {
        console.error('Listener error:', err);
    });
}

export async function stopListener() {
    await listener.query('UNLISTEN new_travel_entry');
    await listener.end();

    console.log('Listener stopped.');
}

export const dbEvents = new EventEmitter();