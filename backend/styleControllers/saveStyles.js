const stylesConnection = require("../config/stylesConnection");

exports.saveStyleDetails = async (req, res) => {
    const {
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

    const sql = `
        SELECT id
        FROM mst_category
        ORDER BY id DESC
        LIMIT 1
    `;

    stylesConnection.query(sql, (err, result) => {

        const nextId =
        result.length === 0
        ? 1
        : result[0].id + 1;

        let category_id = category ? category.param_id : null;
        let subCategory_id = subCategory ? subCategory.param_id : null;
        let gender_id = gender ? gender.param_id : null;
        let isActive = status === true ? 1 : 0; 

        const sqlMain = "CALL mst_category(?, ?, ?, ?, ?, ?, ?, ?)";

        stylesConnection.query(sqlMain, [
            nextId,
            styleNumber,
            category_id,
            subCategory_id,
            gender_id,
            productTitle,
            productDescription,
            isActive
        ], (err, result) => {
            if (err) {
                console.error("Main Master Block Error:", err);
                
                if (err.code === 'ER_DUP_ENTRY' || err.sqlState === '23000') {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Style Number '${styleNumber}' already exists! Please use a unique Style Number.` 
                    });
                }
                
                return res.status(500).json({ success: false, message: "Internal server error while saving main details" });
            }

            const metalJson = JSON.stringify(metals || []);
            const diamondJson = JSON.stringify(diamonds || []);

            let queriesToRun = 0;
            let queriesCompleted = 0;
            let queryHasError = false;

            if (metals && Array.isArray(metals) && metals.length > 0) queriesToRun++;
            if (diamonds && Array.isArray(diamonds) && diamonds.length > 0 && diamondJson !== "[]") queriesToRun++;

            if (queriesToRun === 0) {
                return res.json({ success: true, message: "Style Master details saved successfully without dynamic arrays." });
            }

            const checkCompletion = () => {
                queriesCompleted++;
                if (queriesCompleted === queriesToRun && !queryHasError) {
                    return res.json({ success: true, message: "Entire Style details packaged and saved successfully!" });
                }
            };

            const sqlDetails = "CALL style_details(?,?,?)";

            if (metals && Array.isArray(metals) && metals.length > 0) {
                stylesConnection.query(sqlDetails, [nextId, "METAL", metalJson], (mErr, mResult) => {
                    if (mErr) {
                        console.error("Metal Details Insertion Error:", mErr);
                        queryHasError = true;
                        if (!res.headersSent) {
                            return res.status(500).json({ success: false, error: 'Database Error while inserting Metal details' });
                        }
                    }
                    checkCompletion();
                });
            }

            if (diamonds && Array.isArray(diamonds) && diamonds.length > 0 && diamondJson !== "[]") {
                console.log("=== DIAMOND DETAILS INBOUND ===");
                stylesConnection.query(sqlDetails, [nextId, "DIAMOND", diamondJson], (dErr, dResult) => {
                    if (dErr) {
                        console.error("Diamond Details Insertion Error:", dErr);
                        queryHasError = true;
                        if (!res.headersSent) {
                            return res.status(500).json({ success: false, error: 'Database Error while inserting Diamond details' });
                        }
                    }
                    checkCompletion();
                });
            }
        });

    });
};