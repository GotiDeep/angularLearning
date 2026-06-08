const dbconnection = require("../config/stylesConnection")

exports.getCustomers = async (req,res) => {
    sql = "CALL getCustomers()";

    dbconnection.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json({
                message: 'Error'
            });
        }
        res.json(result[0]);
    });
};