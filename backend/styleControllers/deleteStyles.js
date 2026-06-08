const stylesConnection = require('../config/stylesConnection');

exports.deleteStyle = (req, res) => {
    const { id } = req.params;
    const query = `CALL deleteStyle(?)`;
    stylesConnection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        res.json({ success: true, message: 'Style Deleted Successfully' });
    });
};