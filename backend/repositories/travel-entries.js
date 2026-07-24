import { pool } from '../db/db.js';

const statusDictionary = {
  0: 'Pending',
  1: 'Cancelled',
  2: 'Approved',
  3: 'Rejected'
};

export async function getAllTravelEntries() {
    const result = await pool.query(
        `
        SELECT *
        FROM travel_entries
        ORDER BY serial_no DESC
        `
    );

    return result.rows;
}

export async function getTravelEntriesByPage(page) {
    const limit = 50;
    page = Math.max(1, Number(page) || 1);
    const offset = limit * (page - 1) 

    const sqlCaseBranches = Object.entries(statusDictionary)
        .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
        .join('\n                    ');

    const rowsResult = await pool.query(
        `
            SELECT 
                te.*,
                d.dep_code AS department_code,
                d.dep_name AS department_name,
                COUNT(*) OVER() AS total_count,
                CASE te.status
                   ${sqlCaseBranches}
                    ELSE 'Unknown'
                END AS status_label
            FROM travel_entries te
            INNER JOIN departments d ON te.department = d.dep_id
            ORDER BY serial_no DESC
            LIMIT $1 OFFSET $2
            `,
            [limit, offset]
        );
    
    const entries = rowsResult.rows;
    const totalRows = entries.length > 0 ? parseInt(entries[0].total_count, 10) : 0;

    return {
        data: entries,
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit)
    };
}

export async function getTravelEntryById(id) {
    const result = await pool.query(
        `
        SELECT *
        FROM travel_entries
        WHERE serial_no = $1
        `,
        [id]
    );

    return result.rows[0];
}

export async function createTravelEntry(values) {
    const sql = `
        INSERT INTO travel_entries
        (
            date_received,
            name,
            first_name,
            last_name,
            department,
            inclusive_dates,
            purpose,
            whereto
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    return pool.query(sql, values);
}

export async function updateTravelEntryStatus(values) {
    const sqlCaseBranches = Object.entries(statusDictionary)
        .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
        .join('\n                    ');

    const sql = `
        UPDATE travel_entries
        SET 
            status = $2
        WHERE serial_no = $1
        RETURNING 
            *,
            CASE status
                ${sqlCaseBranches}
                ELSE 'Unknown'
            END AS status_label;
    `;
    return pool.query(sql, values);
}

export async function updateTravelEntry(values) {
    const sql = `
        UPDATE travel_entries
        SET 
            date_received = $2,
            name = $3,
            first_name = $4,
            last_name = $5,
            department = $6,
            inclusive_dates = $7,
            purpose = $8,
            whereto = $9
        WHERE serial_no = $1
        RETURNING *;
    `;
    return pool.query(sql, values);
}

export async function searchTravelEntries(searchQuery,page) {
    const limit = 50;
    page = Math.max(1, Number(page) || 1);
    const offset = limit * (page - 1) 
    const terms = searchQuery.trim().split(/\s+/).filter(term => term.length > 0);

    let rows = [];
    let totalRows = 0;
    
    // Fallback: If no search query is provided, return all entries cleanly
    if (terms.length === 0) {
        const countRes = await pool.query('SELECT COUNT(*) FROM travel_entries');
        totalRows = parseInt(countRes.rows[0].count, 10); // FIX: Added [0] index array accessor

        const sqlCaseBranches = Object.entries(statusDictionary)
            .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
            .join('\n                    ');

        const dataRes = await pool.query(`
            SELECT
                te.*,
                departments.dep_name,
                departments.dep_code,
                CASE te.status
                   ${sqlCaseBranches}
                    ELSE 'Unknown'
                END AS status_label
            FROM travel_entries te
            INNER JOIN departments ON te.department = departments.dep_id
            ORDER BY te.serial_no DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        rows = dataRes.rows;
    }else{
        const sqlCaseBranches = Object.entries(statusDictionary)
            .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
            .join('\n                    ');

        const columns = [
            'te.serial_no',
            'te.first_name',
            'te.last_name',
            'departments.dep_name',
            'departments.dep_code',
            'te.purpose',
            'te.whereto',
            `(CASE te.status
                ${sqlCaseBranches}
                ELSE 'Unknown'
            END)`,
        ];

        const values = [];
        const conditionGroups = [];
        let paramIndex = 1;

        terms.forEach((term) => {
            const columnMatches = columns.map(col => {
                const currentPlaceholder = `$${paramIndex}`;
                paramIndex++; 
                values.push(`%${term}%`); 
                return `${col} ILIKE ${currentPlaceholder}`;
            });
            conditionGroups.push(`(${columnMatches.join(' OR ')})`);
        });

        const filterSql = conditionGroups.join(' AND ');

        // 1. Get the counted matches first
        const countSql = `
            SELECT COUNT(*)
            FROM travel_entries te
            INNER JOIN departments ON te.department = departments.dep_id
            WHERE ${filterSql}
        `;
        const countRes = await pool.query(countSql, values);
        totalRows = parseInt(countRes.rows[0].count, 10); // FIX: Added [0] index array accessor
        
        // 2. Fetch the actual records
        let dataSql = `
            SELECT 
                te.*,
                departments.dep_name,
                departments.dep_code,
                CASE te.status
                   ${sqlCaseBranches}
                    ELSE 'Unknown'
                END AS status_label
            FROM travel_entries te
            INNER JOIN departments ON te.department = departments.dep_id
            WHERE ${filterSql}
            ORDER BY te.serial_no DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        values.push(limit);
        values.push(offset); 

        const dataRes = await pool.query(dataSql, values);
        rows = dataRes.rows;
    }

    return {
        data: rows,
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit)
    };
}