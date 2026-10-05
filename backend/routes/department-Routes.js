import express from 'express';
import * as API from '../repositories/department.js';

const router = express.Router();

router.post('/create',async (req, res) => {
    const {dep_code,dep_name} = req.body
    try {
        const result = await API.createDepartment(dep_code,dep_name);
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

router.get('/', async (req, res) => {
    try {
        const data = await API.getAllDepartments();
        res.json(data);
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await API.deleteDepartment(id);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({
            success: true,
            message: 'Department deleted',
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.patch('/:id',async (req, res) => {
    const { id, data } = req.body;

    try {
        const fields = Object.keys(data);

        if (fields.length === 0) {
            return res.status(400).json({
                error: "No fields to update"
            });
        }

        const result = await API.updateDepartment(id,data);
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Department not found"
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
})

// router.patch('/:id',async (req, res) => {

// })

export default router;