import express from 'express';
import * as API from '../repositories/personnel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await API.getAllPersonnel();
        data.forEach(values => {
            values.employment_history.forEach(e => {
                e.appointment_date = daterangeStrtoArray(e.appointment_date)[0];
            })
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
            values.employment_history.forEach(e => {
                e.appointment_date = daterangeStrtoArray(e.appointment_date)[0];
            })
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

        result.rows.forEach(values => {
            values.all_travel_arrays.forEach(dates =>{
                dates = daterangeStrtoArray(dates);
            })
        })

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
    const { id } = req.params;
    try {
        const result = await API.getPersonnelByUUID(id);
        if (result.rows.length > 0){
            result.rows[0].employment_history.forEach(e => {
                e.appointment_date = daterangeStrtoArray(e.appointment_date)[0];
            })
            setActiveStatus(result.rows[0]);
            res.json({
                success: true,
                data: result.rows[0]
            });
        }else{
            return res.status(400).json({
                success: false,
                message: `Personnel ${id} not found`
            });
        }
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
		eligibility
    } = req.body;

    try {
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
            eligibility
        ];

        const result = await API.createPersonnel(values);

        res.json({
            success: true,
            data: result.rows[0]
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
        }

        const updates = {}

        for (const [key, value] of Object.entries(data)) {
            if (fieldMap[key]) {
                updates[fieldMap[key]] = value
            }
        }

        const result = await API.patchPersonnel(id,updates)
        setActiveStatus(result.rows[0]);
        res.json({
            success: true,
            data: result.rows
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

router.post('/employment/create:id',async (req, res) => {
    const { id } = req.params
    const data = req.body

    try {
        if (
            data.appointment_date.start === "" &&
            data.appointment_date.end === "" && 
            data.job_position === "" || data.job_position === null &&
            data.job_type === "" || data.job_type === null &&  
            data.dep_id === null
        ) {
            return res.status(404).json({
                success: false,
                message: 'Empty fields'
            });
        }

        if (data.personnel_uuid && id !== data.personnel_uuid) {
            return res.status(404).json({
                success: false,
                message: 'Conflicting personnel uuid'
            });
        }

        const { start, end } = data.appointment_date

        if (start && end) {
            data.appointment_date = `[${start},${end}]`
        } else if (start) {
            data.appointment_date = `[${start},)`
        } else if (end) {
            data.appointment_date = `(,${end}]`
        } else {
            data.appointment_date = null
        }
        const values = Object.values(data);
        const result = await API.createPersonnelEmploymentHistory(id,values);
        result.rows[0].appointment_date = daterangeStrtoArray(result.rows[0].appointment_date)[0];
        res.json({
            success: true,
            data: result.rows[0]
        });
    }catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

router.patch('/employment/:id',async (req, res) => {
    const { id } = req.params
    const data = req.body

    try{
        let personnelemploymentupdateresult = null
        if (data.appointment_date){
            const { start, end } = data.appointment_date

            if (start && end) {
                data.appointment_date = `[${start},${end}]`
            } else if (start) {
                data.appointment_date = `[${start},)`
            } else if (end) {
                data.appointment_date = `(,${end}]`
            } else {
                data.appointment_date = null
            }
        }

        const result = await API.patchPersonnelEmploymentHistory(id,data)
        result.rows[0].appointment_date = daterangeStrtoArray(result.rows[0].appointment_date)[0];
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.log(err)
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
    
})

// Formats psql date range string to array and sort
export function daterangeStrtoArray(dateStr) {
    const strdates = []
    if (!!dateStr){
        const match = dateStr.replace(/"/g, "").match(/[\[(][^)\]]*[\])]/g);
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