const stylesConnection = require("../config/stylesConnection");

exports.getStyles = async (req, res) => {
    const sql = "CALL getStyles()";

    stylesConnection.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching styles:", err);
            return res.status(500).json({ success: false, message: "Error fetching styles" });
        }
        res.json(result[0]);
    });
};

exports.getStyleById = async (req, res) => {
    let id = req.params.id; 

    if (id !== undefined && id !== null && id !== 'null' && id !== '') {
        id = id;
    } else {
        id = "";
    }

    const sql = "CALL getStyleById(?)";

    stylesConnection.query(sql, id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error" });
        }
        
        if (id !== "") {
            const rawData = result[0] ? result[0][0] : null;
            
            if (!rawData) {
                return res.status(404).json({ success: false, message: "Not Found" });
            }
            
            return res.json({
                success: true,
                data: {
                    master: typeof rawData.master === 'string' ? JSON.parse(rawData.master) : rawData.master,
                    metals: typeof rawData.metals === 'string' ? JSON.parse(rawData.metals) : rawData.metals,
                    diamonds: typeof rawData.diamonds === 'string' ? JSON.parse(rawData.diamonds) : rawData.diamonds
                }
            });
        } else {
            return res.json(result[0] || []);
        }
    });
};