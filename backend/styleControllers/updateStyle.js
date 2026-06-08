const stylesConnection = require("../config/stylesConnection");

exports.updateStyle = async (req, res) => {
    try {
        
        const {
            id,                  
            styleNumber,         
            category,
            subCategory,
            gender,
            productTitle,
            productDescription,
            status,
            metals,              
            diamonds             
        } = req.body;

        let p_id = id ? parseInt(id) : null;
        let category_id = category ? (category.param_id || category) : null;
        let subCategory_id = subCategory ? (subCategory.param_id || subCategory) : null;
        let gender_id = gender ? (gender.param_id || gender) : null;
        let isActive = status === true || status === 1 ? 1 : 0;


        const metalJsonString = JSON.stringify(metals || []);
        const diamondJsonString = JSON.stringify(diamonds || []);

        const sqlUpdateSp = "CALL updateStyle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        const params = [
            p_id,
            styleNumber,
            category_id,
            subCategory_id,
            gender_id,
            productTitle,
            productDescription,
            isActive,
            metalJsonString,  
            diamondJsonString  
        ];

        stylesConnection.query(sqlUpdateSp, params, (err, result) => {
            if (err) {
                console.error("Database Procedure Execution Error:", err);
                
                if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Style Number/ID conflict detected! Please verify input data.` 
                    });
                }
                
                return res.status(500).json({ success: false, message: "Internal Database Error during update process" });
            }

            console.log(`Style ID ${p_id} and all sub-grid variants synced successfully in DB.`);
            return res.json({ 
                success: true, 
                message: "Master category updated and all raw sub-grid arrays parsed seamlessly!" 
            });
        });

    } catch (catchError) {
        console.error("Backend Controller Crash Trace:", catchError);
        return res.status(500).json({ success: false, message: "Critical Server Exception Error" });
    }
};