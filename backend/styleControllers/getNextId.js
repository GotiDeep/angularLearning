const stylesConnection = require('../config/stylesConnection');

exports.getNextId = (req, res) => {

    const sql = `
        SELECT style_number
        FROM mst_category
        ORDER BY style_number DESC
        LIMIT 1
    `;

    stylesConnection.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                error: 'Database Error'
            });
        }

        if (result.length === 0) {
            return res.json({
                styleNumber: 'STYLE00001'
            });
        }

        const lastStyleNumber = result[0].style_number;

        const numberPart = lastStyleNumber.replace('STYLE', '');

        const nextNumber = parseInt(numberPart) + 1;

        const paddedNumber = nextNumber.toString().padStart(5, '0');

        const newStyleNumber = `STYLE${paddedNumber}`;

        res.json({
            styleNumber: newStyleNumber
        });

    });

};

exports.getId = (req, res) => {

};