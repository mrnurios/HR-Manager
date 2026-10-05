import { pool } from '../db/db.js';

export async function getAllDepartments() {
    const result = await pool.query(
        `
            SELECT 
                d.dep_id,
                d.dep_code,
                d.dep_name,
                COUNT(p.dep_id) AS total_references
            FROM departments d
            LEFT JOIN personnel p ON d.dep_id = p.dep_id
            GROUP BY d.dep_id
            ORDER BY d.dep_code, d.dep_name;
        `
    );

    return result.rows;
}

export async function createDepartment(dep_code,dep_name) {
    const sql = `
        INSERT INTO
        departments (
            dep_code,dep_name
            )
        VALUES ($1,$2)
        RETURNING *,0 AS total_references;
    `

    return await pool.query(sql,[dep_code,dep_name]);
}

export async function updateDepartment(dep_id,data) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    const setSql = fields
        .map((field, index) => `"${field}" = $${index + 1}`)
        .join(", ");

    values.push(dep_id);

    const sql = `
        WITH updated_department AS (
            UPDATE departments
            SET ${setSql}
            WHERE dep_id = $${values.length}
            RETURNING *
        )
        SELECT 
            ud.*,
            COUNT(p.dep_id) AS total_references
        FROM updated_department ud
        LEFT JOIN personnel p ON ud.dep_id = p.dep_id
        GROUP BY ud.dep_id,ud.dep_code,ud.dep_name;
    `;
    return pool.query(sql, values);
}

export async function deleteDepartment(id) {
    const sql = `
        DELETE FROM departments
        WHERE dep_id = $1
        RETURNING *;
    `;

    return await pool.query(sql, [id]);
};