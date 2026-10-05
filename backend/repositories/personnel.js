import { pool } from '../db/db.js';

export async function getAllPersonnel() {
    const result = await pool.query(
        `
        SELECT *
        FROM personnel
        ORDER BY last_name ASC, first_name ASC;
        `
    );

    return result.rows;
}

export async function getPersonnelByUUID(id) {
    const result = await pool.query(
        `SELECT * FROM personnel WHERE personnel_uuid = $1`,
        [id]
    )
    return result.rows;
}

export async function createPersonnel(values) {
    const sql = `
        INSERT INTO personnel
        (
            first_name,
            middle_name,
            last_name,
            ext_name,
            sex,
            civilstatus,
            educational_attainment,
            birthdate,
            birthplace,
            contact_number,
            is_pwd,
            pwd_id,
            is_soloparent,
            solo_id,
            barangay,
            purok,
            other_purok,
            other_address,
            eligibility_level,
            personnel_type,
            dep_id,
            appointment_dates
        )
        VALUES (${valuestostringcount(values)})
        RETURNING *;
    `;

    return pool.query(sql, values);
}

export async function patchPersonnel(uuid,updates){
    const fields = Object.keys(updates)

    if (fields.length === 0) {
        throw new Error('No valid fields to update')
    }

    const values = Object.values(updates)

    const setClause = fields
        .map((field, index) => `"${field}" = $${index + 1}`)
        .join(', ')

    values.push(uuid)

    const sql = `
        UPDATE personnel
        SET ${setClause}
        WHERE personnel_uuid = $${values.length}
        RETURNING *;
    `
    return await pool.query(sql, values)
}

export async function searchPersonnel(searchQuery) {
    const terms = searchQuery.trim().split(/\s+/).filter(term => term.length > 0);

    let rows = [];

    // Fallback: If no search query is provided, return all entries cleanly
    if (terms.length === 0) {
        rows = getAllPersonnel()
    }else{
        // Columns to compare to query
        const columns = [
            'first_name',
            'middle_name',
            'last_name',
            'ext_name',
            'barangay',
            'purok',
            'other_address',
            'other_purok',
            'contact_number',
            'd.dep_code',
            'd.dep_name',
            'birthplace',
            'sex::text'
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

        const dataSql = `
            SELECT *
            FROM personnel p
            LEFT JOIN departments d ON p.dep_id = d.dep_id
            WHERE ${filterSql}
            ORDER BY last_name ASC, first_name ASC;
        `;

        rows = await pool.query(dataSql, values);
    }

    return rows;
}

export async function deletePersonnel(uuid) {
    const sql = `
        DELETE FROM personnel
        WHERE personnel_uuid = $1
        RETURNING *;
    `;

    return await pool.query(sql, [uuid]);
};

export async function getPersonnelTravelEntriesAndPasslips(startDate,endDate){
    const sql = `
        WITH monthly_travel AS (
            SELECT 
                te.personnel_uuid,
                JSONB_AGG(r) AS all_travel_arrays
            FROM travel_entries te
            CROSS JOIN LATERAL unnest(te.inclusive_dates) AS r
            WHERE r && daterange($1, $2, '[]')
            GROUP BY te.personnel_uuid
        ),
        monthly_pass_slips AS (
            SELECT 
                ps.personnel_uuid,
                JSONB_AGG(ps.inclusive_date ORDER BY ps.inclusive_date) AS all_pass_slips
            FROM pass_slip ps
            WHERE daterange($1, $2, '[]') @> ps.inclusive_date
            GROUP BY ps.personnel_uuid
        )

        SELECT 
            p.personnel_uuid,
            COALESCE(t.all_travel_arrays, '[]'::jsonb) AS all_travel_arrays,
            COALESCE(s.all_pass_slips, '[]'::jsonb) AS all_pass_slips
        FROM personnel p
        LEFT JOIN monthly_travel t 
            ON p.personnel_uuid = t.personnel_uuid
        LEFT JOIN monthly_pass_slips s 
            ON p.personnel_uuid = s.personnel_uuid
        WHERE t.personnel_uuid IS NOT NULL 
        OR s.personnel_uuid IS NOT NULL
        ORDER BY p.last_name ASC,p.first_name ASC;
    `

    return await pool.query(sql, [startDate,endDate]);
}

function valuestostringcount(values){
    const counts = []
    let count = 1
    values.forEach(element => {
        counts.push(`$${count}`)
        count ++;
    });
    return counts.join(',')
}