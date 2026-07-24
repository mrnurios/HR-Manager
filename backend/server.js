import express from 'express';
import { startListener } from './db/listener.js';
import travelrouter from './routes/travel-Routes.js';
import personnelrouter from './routes/personnel-Routes.js';
import cors from 'cors';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env'); 
const PORT = process.env.PORT || 5001;
export let clients = [];

function runfrontend(app){
    const frontendBuildPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendBuildPath));
    app.get('/*any', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });

    console.log(`Frontend Server running on port ${PORT}`);
}

async function init(){
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use('/api/travel-entries', travelrouter);
    app.use('/api/departments', personnelrouter);

    app.get('/api/travel-stream', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        clients.push(res);

        req.on('close', () => {
            clients = clients.filter(client => client !== res);
        });
    });

    // Uncomment if ready for production
    // runfrontend(app)

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend Server running on port ${PORT}`);
    });

    await startListener();
}

if (fs.existsSync(envPath)) {
    init()
} else {
    console.warn('❌ Warning: .env file is missing from the backend folder!');
}