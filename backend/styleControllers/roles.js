const dbconection = require("../config/stylesConnection");

exports.roles = async (req, res) => {
    try {
        // MySQL2 mein [rows] = await query() pattern use hota hai
        // result.rows → ye PostgreSQL ka syntax hai, MySQL mein kaam nahi karta
        const [roles] = await dbconection.promise().query('SELECT * FROM roles');
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};