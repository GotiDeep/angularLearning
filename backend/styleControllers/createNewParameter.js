const stylesConnection = require('../config/stylesConnection');

exports.createNewParameter = async (req, res) => {
    const { newType } = req.body;
    let parameterId = "";
    let typeCode = newType
        ? newType.trim().toUpperCase().replace(/\s+/g, '_')
        : "";

    try {
        const query = `CALL mst_parameter( ?, ?, ?)`;

        stylesConnection.query(query,[parameterId,newType,typeCode,],(err,result)=>{
            if(err){
                console.log(err);
                if (err.sqlState === '23000' || err.sqlState === '45000') {
                            return res.status(400).json({ 
                                success: false, 
                                message: err.message 
                            });
                        }
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to create parameter' 
                });
            }
            return res.status(200).json({ 
                success: true, 
                message: 'Parameter created successfully' 
            });
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to create parameter' 
        });
    }
}