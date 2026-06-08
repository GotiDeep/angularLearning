const dbconnection = require('../config/stylesConnection');

exports.deleteCustomer = (req, res) => {
  // URL ID

  const customerId = req.params.customerId;

  // JSON OBJECT

  const customerData = {
    customerId,
  };

  // STORED PROCEDURE

  const sql = 'CALL customers(?)';

  // QUERY

  dbconnection.query(
    sql,

    [JSON.stringify(customerData)],

    (err, result) => {
      // ERROR

      if (err) {
        console.log(err);
        return res.status(500).json({
          error: 'Database Error',
        });
      }

      // SUCCESS

      res.json({
        message: 'Customer Deleted Successfully',
      });
    },
  );
};
