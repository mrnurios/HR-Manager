import { pool } from '../db/db.js';

export async function getAllDepartments() {
    const result = await pool.query(
        `
        SELECT *
        FROM departments
        ORDER BY dep_name
        `
    );

    return result.rows;
}