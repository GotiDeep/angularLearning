const dbconnection = require('../config/stylesConnection');

const insertCustomerData = (data) => {
  return new Promise((resolve, reject) => {
    const CustomerData = JSON.stringify(data);

    const sql = 'CALL customers(?)';

    dbconnection.query(
      sql,

      [CustomerData],

      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

exports.insertCustomerData = insertCustomerData;

exports.addCustomer = async (req, res) => {
  const { customerId, customerName, customerEmail, customerMobile, customerDOB, customerCity } =
    req.body;

  const customerImage = req.file ? req.file.filename : '';

  // OBJECT

  const customerData = {
    customerId,
    customerImage,
    customerName,
    customerEmail,
    customerMobile,
    customerDOB,
    customerCity,
  };

  try {
    await insertCustomerData(customerData);

    res.json({
      message: 'Customer Added Successfully',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};
