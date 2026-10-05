import { pool } from '../db/db.js';

const statusDictionary = {
  null: 'Yet to return'
};

export async function getAllPassSlips() {
    const result = await pool.query(
        `
        SELECT *
        FROM pass_slip
        ORDER BY date_issued DESC
        `
    );

    return result.rows;
}

export async function getPassSlipsByPage(page) {
    const limit = 50;
    page = Math.max(1, Number(page) || 1);
    const offset = limit * (page - 1) 

    const rowsResult = await pool.query(
        `
            SELECT 
                ps.*,
                p.first_name AS first_name,
                p.last_name AS last_name,
                COUNT(*) OVER() AS total_count
            FROM pass_slip ps
            INNER JOIN personnel p ON ps.personnel_uuid = p.personnel_uuid
            ORDER BY date_issued DESC
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

export async function patchPassSlip(id,updates){
    const fields = Object.keys(updates)

    if (fields.length === 0) {
        return res.status(400).json({
            message: 'No valid fields to update'
        })
    }

    const values = Object.values(updates)

    const setClause = fields
        .map((field, index) => `"${field}" = $${index + 1}`)
        .join(', ')

    values.push(id)

    const sql = `
        UPDATE pass_slip
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING *;
    `
    return await pool.query(sql, values)
}

// export async function getPassSlipId(id) {
//     const result = await pool.query(
//         `
//         SELECT *
//         FROM travel_entries
//         WHERE serial_no = $1
//         `,
//         [id]
//     );

//     return result.rows[0];
// }

export async function createPassSlip(values) {
    const sql = `
        INSERT INTO pass_slip
        (
            personnel_uuid,
            destination,
            purpose,
            time_departure,
            time_arrival,
            inclusive_date
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    return pool.query(sql, values);
}

export async function updatePassSlip(values) {
    // const sql = `
    //     UPDATE travel_entries
    //     SET 
    //         date_received = $2,
    //         name = $3,
    //         first_name = $4,
    //         last_name = $5,
    //         department = $6,
    //         inclusive_dates = $7,
    //         purpose = $8,
    //         whereto = $9
    //     WHERE serial_no = $1
    //     RETURNING *;
    // `;
    return pool.query(sql, values);
}

export async function searchPassSlip(searchQuery,page) {
    const limit = 50;
    page = Math.max(1, Number(page) || 1);
    const offset = limit * (page - 1) 
    const terms = searchQuery.trim().split(/\s+/).filter(term => term.length > 0);

    let rows = [];
    let totalRows = 0;
    
    // Fallback: If no search query is provided, return all entries cleanly
    if (terms.length === 0) {
        const dataRes = await pool.query(`
            SELECT
                ps.*,
                p.personnel_uuid AS personnel_uuid,
                COUNT(*) OVER() AS total_count,
            FROM pass_slip te
            INNER JOIN personnel p ON ps.personnel_uuid = p.personnel_uuid
            ORDER BY date_issued DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        rows = dataRes.rows;
    }else{
        const columns = [
            'p.first_name',
            'p.last_name',
            'ps.destination',
            'ps.purpose',
            `(CASE
                WHEN ps.time_arrival IS NULL THEN 'Yet to return'
                ELSE 'Returned'
            END)`,
            `CONCAT(
                EXTRACT(YEAR FROM ps.date_issued)::int,
                '-',
                TO_CHAR(ps.pass_no, 'FM0000')
            )`
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

        let dataSql = `
            SELECT 
                ps.*,
                p.first_name,
                p.last_name,
                COUNT(*) OVER() AS total_count
            FROM pass_slip ps
            INNER JOIN personnel p ON ps.personnel_uuid = p.personnel_uuid
            WHERE ${filterSql}
            ORDER BY ps.date_issued DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        values.push(limit);
        values.push(offset); 

        const dataRes = await pool.query(dataSql, values);
        rows = dataRes.rows;
    }
    totalRows = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    
    return {
        data: rows,
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit)
    };
}