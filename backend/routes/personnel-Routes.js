import express from 'express';
import {
    getAllDepartments
} from '../repositories/personnel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const data = await getAllDepartments();
    res.json(data);
});

export default router;