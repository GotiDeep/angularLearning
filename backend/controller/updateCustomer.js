const dbconnection = require('../config/stylesConnection');

exports.updateCustomer = async (req, res) => {
  const customerData = {
    customerId: req.params.customerId,
    customerImage: req.file ? `${req.file.filename}` : '',
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail,
    customerMobile: req.body.customerMobile,
    customerDOB: req.body.customerDOB,
    customerCity: req.body.customerCity,
  };

  const sql = 'CALL customers(?)';

  dbconnection.query(sql, [JSON.stringify(customerData)], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: 'Customer update failed',
      });
    }

    res.json({
      message: 'Customer updated successfully',
      result,
    });
  });
};