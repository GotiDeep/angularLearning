const dbconnection = require('../config/stylesConnection');

const exceljs = require('exceljs');

exports.exportCustomers = (req, res) => {
  // FRONTEND DATA

  const {
    selection,

    selectedCustomers,
  } = req.body;

  // GET CUSTOMERS

  const sql = 'CALL getCustomers()';

  dbconnection.query(
    sql,

    async (err, result) => {
      if (err) {
        return res.status(500).json({
          error: 'Database Error',
        });
      }

      // ALL CUSTOMERS

      let customers = result[0];

      // SELECTED

      if (selection === 'Selected') {
        customers = customers.filter((customer) => selectedCustomers.includes(customer.customerId));
      }

      // NON SELECTED
      else if (selection === 'Non Selected') {
        customers = customers.filter(
          (customer) => !selectedCustomers.includes(customer.customerId),
        );
      }

      // WORKBOOK

      const workbook = new exceljs.Workbook();

      // SHEET

      const worksheet = workbook.addWorksheet(`${selection} Customers`);

      // COLUMNS

      worksheet.columns = [
        {
          header: 'Customer Id',
          key: 'customerId',
          width: 20,
        },

        {
          header: 'Customer Name',
          key: 'customerName',
          width: 25,
        },

        {
          header: 'Customer Email',
          key: 'customerEmail',
          width: 30,
        },

        {
          header: 'Customer Mobile',
          key: 'customerMobile',
          width: 20,
        },

        {
          header: 'Customer DOB',
          key: 'customerDOB',
          width: 20,
        },

        {
          header: 'Customer City',
          key: 'customerCity',
          width: 20,
        },
      ];

      // ROWS

      customers.forEach((customer) => {
        worksheet.addRow(customer);
      });

      // HEADERS

      res.setHeader(
        'Content-Type',

        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      res.setHeader(
        'Content-Disposition',

        'attachment; filename=customers.xlsx',
      );

      // SEND FILE

      await workbook.xlsx.write(res);

      res.end();
    },
  );
};
