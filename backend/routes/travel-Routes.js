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
        personnel_uuid,
        department,
        inclusive_dates,
        purpose,
        whereto
    } = req.body;

    try {

        const values = [
            personnel_uuid,
            department,
            inclusive_dates.map(r => `[${r.start},${r.end}]`),
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

router.patch("/patch/:id", async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const fields = Object.keys(data);

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No fields to update"
            });
        }

        const [date_year, travel_no] = id.split('-')
        if (data.inclusive_dates) data.inclusive_dates = data.inclusive_dates.map(r => `[${r.start},${r.end}]`)

        const result = await API.updateTravelEntry(date_year,travel_no,data);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: "Travel entry not found"
            });
        }

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