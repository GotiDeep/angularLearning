const dbconnection = require("../config/stylesConnection");

exports.getUserPermissions = async (req,res)=>{

    const {roleId} = req.body;

    console.log(roleId);

    if (!roleId) {
        return res.status(400).json({
            success:false,
            message:"Role ID is required",
            error:"Invalid Request"
        });
    }

    try {
        const sql = `CALL GetUserPermissions(${roleId})`;
        const [result] = await dbconnection.query(sql);
        res.json({
            success:true,
            message:"User Permissions",
            data:result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message
        });
    }
}   