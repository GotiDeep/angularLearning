const dbconnection = require('../config/stylesConnection');

exports.nextCustomerId = async (req,res) => {

    sql = "CALL nextCustomerId()";

    dbconnection.query(sql,(err,result)=>{
        if(err){
            return res.status(500).json({error:"DataBase Error"});
        }

        if(result.length === 0){
            return res.json({customerId:"CUST0001"});
        }

        const lastCustomer = result[0][0].customerId;

        const numberPart = lastCustomer.replace('CUST','');

        const nextNumber = parseInt(numberPart)+1;

        const paddedNumber = nextNumber.toString().padStart(4,'0');

        const newCustomerId = `CUST${paddedNumber}`;

        res.json({
            customerId: newCustomerId
        });
    })

}