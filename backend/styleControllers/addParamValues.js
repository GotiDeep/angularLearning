const stylesConnection = require('../config/stylesConnection');

exports.addParamValues = (req, res) => {
    const { typeKey, itemLabel, parentId, isActive } = req.body;
    let param_id = "";
    let param_name = itemLabel;
    let param_code = param_name ? param_name.trim().toUpperCase().replace(/\s+/g, '_') : "";
    let key_param_id = typeKey ? typeKey.param_id: null;
    let key_param = typeKey ? typeKey.param_code : "";
    let parent_id = parentId;
    let is_active = isActive;

    if(is_active == true){
        is_active = 1;
    }
    else{
        is_active = 0;
    }

    const query = `CALL master_parameter(?, ?, ?, ?, ?, ?, ?);`;
    stylesConnection.query(query,[param_id,param_name,param_code,key_param_id,key_param,parent_id,is_active],(err,result)=>{
        if(err){
            console.log(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        res.json(result);
    });
};