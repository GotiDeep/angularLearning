const stylesConnection = require('../config/stylesConnection');

exports.loadAllParameters = (req,res) => {
    try{
        const sql = "SELECT * FROM master_parameter";
        stylesConnection.query(sql,(err,result)=>{
            if(err){
                console.log(err);
            }
            res.send(result);
        })
    }catch(error){
        console.log(error);
    }
}