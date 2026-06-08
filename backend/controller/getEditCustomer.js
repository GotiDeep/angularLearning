const dbconnection = require('../config/stylesConnection');

exports.getEditCustomers = async (req, res) => {
  const customerId = req.params.customerId;

  let sql = 'CALL getEditCustomer(?)';

  dbconnection.query(sql, [customerId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error',
      });
    }
    console.log(result[0][0]);
    res.json(result[0][0]);
  });
};
