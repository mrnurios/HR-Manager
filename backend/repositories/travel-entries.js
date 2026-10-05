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
        ORDER BY EXTRACT(YEAR FROM date_received),travel_no DESC
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
                p.first_name as personnel_first_name,
                p.last_name as personnel_last_name,
                COUNT(*) OVER() AS total_count,
                CASE te.status
                   ${sqlCaseBranches}
                    ELSE 'Unknown'
                END AS status_label
            FROM travel_entries te
            INNER JOIN departments d ON te.department = d.dep_id
            LEFT JOIN personnel p ON te.personnel_uuid = p.personnel_uuid
            ORDER BY EXTRACT(YEAR FROM date_received),travel_no DESC
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
    const idparts = id.split('-');

    const result = await pool.query(
        `
        SELECT *
        FROM travel_entries
        WHERE (EXTRACT(YEAR FROM date_received) = $1 AND travel_no = $2)
        `,
        idparts
    );

    return result.rows[0];
}

export async function createTravelEntry(values) {
    const sqlCaseBranches = Object.entries(statusDictionary)
        .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
        .join('\n                    ');

    const sql = `
        INSERT INTO travel_entries
        (
            personnel_uuid,
            department,
            inclusive_dates,
            purpose,
            whereto
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING 
            *,
            CASE status
                ${sqlCaseBranches}
                ELSE 'Unknown'
            END AS status_label;
    `;
    return pool.query(sql, values);
}

export async function updateTravelEntry(date_year,travel_no,data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setSql = fields
        .map((field, index) => `"${field}" = $${index + 1}`)
        .join(", ");

    values.push(date_year, travel_no);
    const sqlCaseBranches = Object.entries(statusDictionary)
        .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
        .join('\n                    ');

    const sql = `
        UPDATE travel_entries
        SET ${setSql}
        WHERE (EXTRACT(YEAR FROM date_received) = $${values.length - 1}
            AND travel_no = $${values.length})
        RETURNING 
            *,
            CASE status
                ${sqlCaseBranches}
                ELSE 'Unknown'
            END AS status_label;
    `;
    return pool.query(sql, values);
}

export async function searchTravelEntries(searchQuery,page) {
    const limit = 50;
    page = Math.max(1, Number(page) || 1);
    const offset = limit * (page - 1) 
    const terms = searchQuery.trim().split(/\s+/).filter(term => term.length > 0);

    let totalRows = 0;
    let dataRes = null;
    // Fallback: If no search query is provided, return all entries cleanly
    if (terms.length === 0) {
        const sqlCaseBranches = Object.entries(statusDictionary)
            .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
            .join('\n                    ');

        dataRes = await pool.query(`
            SELECT
                te.*,
                d.dep_name,
                d.dep_code,
                p.first_name as personnel_first_name,
                p.last_name as personnel_last_name,
                COUNT(*) OVER() AS total_count,
                CASE te.status
                   ${sqlCaseBranches}
                    ELSE 'Unknown'
                END AS status_label
            FROM travel_entries te
            INNER JOIN departments d ON te.department = d.dep_id
            LEFT JOIN personnel p ON te.personnel_uuid = p.personnel_uuid
            ORDER BY EXTRACT(YEAR FROM date_received),travel_no DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
    }else{
        const sqlCaseBranches = Object.entries(statusDictionary)
            .map(([code, label]) => `WHEN ${code} THEN '${label}'`)
            .join('\n                    ');

        const columns = [
            'te.travel_no::text',
            'd.dep_name',
            'd.dep_code',
            'te.purpose',
            'te.whereto',
            'p.first_name',
            'p.last_name',
            `EXTRACT(YEAR FROM te.date_received)::text || '-' || TO_CHAR(te.travel_no, 'FM0000')`,
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

        let dataSql = `
            SELECT 
                te.*,
                d.dep_name,
                d.dep_code,
                p.first_name as personnel_first_name,
                p.last_name as personnel_last_name,
                COUNT(*) OVER() AS total_count,
                CASE te.status
                   ${sqlCaseBranches}
                    ELSE 'Unknown'
                END AS status_label
            FROM travel_entries te
            INNER JOIN departments d ON te.department = d.dep_id
            LEFT JOIN personnel p ON te.personnel_uuid = p.personnel_uuid
            WHERE ${filterSql}
            ORDER BY EXTRACT(YEAR FROM date_received),travel_no DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        values.push(limit);
        values.push(offset); 

        dataRes = await pool.query(dataSql, values);
    }

    totalRows = dataRes.rows.length > 0 ? parseInt(dataRes.rows[0].total_count, 10) : 0;

    return {
        data: dataRes.rows,
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit)
    };
}