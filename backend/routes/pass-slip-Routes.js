import express from 'express';
import * as API from '../repositories/pass-slip.js';

const router = express.Router();

router.post('/create',async (req, res) => {
    const {
        personnel_uuid,
        destination,
        purpose,
        time_departure,
        time_arrival,
        inclusive_date
    } = req.body;

    try {
        const values = [
            personnel_uuid,
            destination,
            purpose,
            time_departure,
            time_arrival || null,
            inclusive_date
        ];

        const result = await API.createPassSlip(values);

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
})

router.get('/page/:page', async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;

        const data = await API.getPassSlipsByPage(page);

        res.json(data);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.patch('/:id',async (req, res) => {
    const { id } = req.params
    const data = req.body

    try {
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            })
        }

        if ('time_arrival' in data && data.time_arrival === "") data.time_arrival = null;
        const result = await API.patchPassSlip(id,data)
        res.json({
            success: true,
            data: result
        });
    }catch(err){
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
    
})

router.get("/search", async (req, res) => {
    try {
        const searchQuery = req.query.q || ""; 
        const page = req.query.page || 1
        const result = await API.searchPassSlip(searchQuery,page);
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

export default router;