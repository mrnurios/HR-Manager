import express from 'express';
import * as API from '../repositories/travel-entries.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const data = await API.getAllTravelEntries();
    res.json(data);
});

router.get('/page/:page', async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;

        const data = await API.getTravelEntriesByPage(page);

        res.json(data);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.post("/create-travel", async (req, res) => {
    const {
        date_received,
        name,
        firstname,
        lastname,
        department,
        inclusive_dates,
        purpose,
        whereto
    } = req.body;

    try {
        const values = [
            date_received,
            `${firstname} ${lastname}`,
            firstname,
            lastname,
            department,
            inclusive_dates.map(r => `[${r.from},${r.to}]`),
            purpose,
            whereto
        ];

        const result = await API.createTravelEntry(values);

        res.json({
            success: true,
            row: result.rows[0]
        });
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.patch("/update-travel/status", async (req, res) => {
    const {
        serial_no,
        status
    } = req.body;

    try {
        const values = [
            serial_no,
            status
        ];

        const result = await API.updateTravelEntryStatus(values);

        res.json({
            success: true,
            row: result.rows[0]
        });
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.put("/update-travel", async (req, res) => {
    const {
        serial_no,
        date_received,
        department,
        firstname,
        lastname,
        inclusive_dates,
        purpose,
        whereto
    } = req.body;

    try {
        const values = [
            serial_no,
            date_received,
            `${firstname} ${lastname}`,
            firstname,
            lastname,
            department,
            inclusive_dates.map(r => `[${r.from},${r.to}]`),
            purpose,
            whereto
        ];

        const result = await API.updateTravelEntry(values);

        res.json({
            success: true,
            row: result.rows[0]
        });
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

router.get("/search", async (req, res) => {
    try {
        const searchQuery = req.query.q || ""; 
        const page = req.query.page || 1
        const result = await API.searchTravelEntries(searchQuery,page);
        res.json(result);
    } catch (error) {
        console.error("Database search error:", error);
        
        // Return a proper 500 server error code if the SQL query fails
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during search query processing." 
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await API.getTravelEntryById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                error: `No travel entry found with serial number: ${req.params.id}`
            });
        }

        res.json(data);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

export default router;