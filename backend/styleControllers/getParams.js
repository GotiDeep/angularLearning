const stylesConnection = require('../config/stylesConnection');

exports.getParams = (req, res) => {
    const sql = 'SELECT * FROM mst_parameter';
    stylesConnection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        res.json(result);
    });
};

exports.getParentParams = (req, res) => {
    const param_id = req.params.param_id;


    const findTypeSql = 'SELECT param_code FROM mst_parameter WHERE param_id = ?';

    stylesConnection.query(findTypeSql, [param_id], (err, typeResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database Error while fetching type' });
        }

        if (typeResult.length === 0) {
            return res.json([]);
        }

        const selectedTypeCode = typeResult[0].param_code;
        console.log('selectedTypeCode', selectedTypeCode)
        let targetParentType = '';

        if (selectedTypeCode === 'SUB_CATEGORY') {
            targetParentType = 'CATEGORY';
        } 
        else if (selectedTypeCode === 'DESIGN') {
            targetParentType = 'SUB_CATEGORY';
        }

        
        if (targetParentType) {
            const fetchParentsSql = 'SELECT param_id, param_name FROM master_parameter WHERE key_param = ? AND is_active = 1';
            
            stylesConnection.query(fetchParentsSql, [targetParentType], (err, parentsResult) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Database Error while fetching parents' });
                }
                console.log(parentsResult);
                res.json(parentsResult);
            });
        } else {
            res.json([]);
        }
    });
};