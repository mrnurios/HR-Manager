import express from 'express';
import * as API from '../repositories/personnel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await API.getAllPersonnel();
        data.forEach(values => {
            values.appointment_dates = daterangeStrtoArray(values.appointment_dates);
            setActiveStatus(values);
        })

        res.json(data);
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
        const result = await API.searchPersonnel(searchQuery);
        result.rows.forEach(values => {
            values.appointment_dates = daterangeStrtoArray(values.appointment_dates);
            setActiveStatus(values);
        })

        res.json({
            success: true,
            rows: result.rows
        });
    } catch (error) {
        console.error("Database search error:", error);
        
        // Return a proper 500 server error code if the SQL query fails
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error during search query processing." 
        });
    }
});

router.get('/gettravelentriesandpassslips',async (req, res) => {
    try {
        const {startDate,endDate} = req.query
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameters: startDate and endDate"
            });
        }

        const result = await API.getPersonnelTravelEntriesAndPasslips(startDate,endDate);

        // result.rows.forEach(values => {
        //     values.all_travel_arrays.forEach(dates =>{
        //         dates = daterangeStrtoArray(dates);
        //     })
        // })

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
})

router.get('/:id',async (req,res)=>{    
    try {
        const { id } = req.params;
        const data = await API.getPersonnelByUUID(id);
        data[0].appointment_dates = daterangeStrtoArray(data[0].appointment_dates);
        setActiveStatus(data[0]);
        res.json(data);
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

router.post('/create',async (req, res) => {
    const {
        fname,
		mname,
		lname,
		ext,
		selectedGender,
		selectedCivilStatus,
		educationalattainment,
		birthdate,
		birthaddress,
		contact,
		isPWD,
		PWDID,
		isSoloParent,
		SoloParentID,
		selectedBarangay,
		selectedPurok,
		specifyPurok,
		additionaladd,
		eligibility,
		personnel_type,
        dep_id,
		appointmentdates
    } = req.body;

    try {
        const ranges = appointmentdates
            .filter(({ start, end }) => start || end) // keep rows with at least one date
            .map(({ start, end }) => {
                if (start && end) {
                return `[${start},${end}]`;
                }

                if (start) {
                    return `[${start},)`; // open-ended
                }

                return `(,${end}]`; // open-beginning
        });

        const values = [
            fname,
            mname,
            lname,
            ext,
            selectedGender,
            selectedCivilStatus,
            educationalattainment,
            birthdate,
            birthaddress,
            contact,
            isPWD,
            PWDID,
            isSoloParent,
            SoloParentID,
            selectedBarangay,
            selectedPurok,
            specifyPurok,
            additionaladd,
            eligibility,
            personnel_type,
            dep_id,
            ranges
        ];

        const result = await API.createPersonnel(values);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

router.patch('/:id',async (req, res) => {
    const { id } = req.params
    const data = req.body

    if (!data || Object.keys(data).length === 0) {
        throw new Error('No valid fields to update')
    }

    try {
        const fieldMap = {
            fname: 'first_name',
            mname: 'middle_name',
            lname: 'last_name',
            ext: 'ext_name',
            selectedGender: 'sex',
            selectedCivilStatus: 'civilstatus',
            educationalattainment: 'educational_attainment',
            birthdate: 'birthdate',
            birthaddress: 'birthplace',
            contact: 'contact_number',
            isPWD: 'is_pwd',
            PWDID: 'pwd_id',
            isSoloParent: 'is_soloparent',
            SoloParentID: 'solo_id',
            selectedBarangay: 'barangay',
            selectedPurok: 'purok',
            specifyPurok: 'other_purok',
            additionaladd: 'other_address',
            eligibility: 'eligibility_level',
            personnel_type: 'personnel_type',
            dep_id: 'dep_id',
            appointmentdates: 'appointment_dates'
        }

        const updates = {}

        for (const [key, value] of Object.entries(data)) {
            if (fieldMap[key]) {
                updates[fieldMap[key]] = value
            }
        }

        if (updates.appointment_dates){
            updates.appointment_dates = updates.appointment_dates
                .filter(({ start, end }) => start || end) // keep rows with at least one date
                .map(({ start, end }) => {
                    if (start && end) {
                    return `[${start},${end}]`;
                    }

                    if (start) {
                        return `[${start},)`; // open-ended
                    }

                    return `(,${end}]`; // open-beginning
            });
        }

        const result = await API.patchPersonnel(id,updates)
        result.rows[0].appointment_dates = daterangeStrtoArray(result.rows[0].appointment_dates);
        setActiveStatus(result.rows[0]);
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await API.deletePersonnel(id);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Personnel not found'
            });
        }

        res.json({
            success: true,
            message: 'Personnel deleted',
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

// Formats psql date range string to array and sort
export function daterangeStrtoArray(dateStr) {
    const strdates = []
    if (!!dateStr){
        const match = dateStr.replace(/"/g, "").match(/\[[^\)]*\)/g);
        if (!match) return strdates;

        match.forEach(d =>{
            const dr = d.replace("[","").replace(")","").split(',')
            if (dr[0].trim() !== '' && dr[1].trim() !== '') {
                const date = new Date(dr[1]);
                date.setDate(date.getDate() - 1)
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const finalenddate = `${year}-${month}-${day}`;

                strdates.push([dr[0],finalenddate])
            }else{
                strdates.push([dr[0],""])
            }
        })

        strdates.sort((a,b) => a[0].localeCompare(b[0]))
    }

    return strdates;
}

function setActiveStatus(row) {
    if (row.appointment_dates){
        const strdates = row.appointment_dates;
        if (!strdates.length) return;
        row.is_active = (strdates[strdates.length-1][1] === "")
    }
}

export default router;