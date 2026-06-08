const XLSX = require('xlsx');

const dbconnection = require('../config/stylesConnection');

const { insertEmployeeData } = require('./datacontroller.js');

const { insertCustomerData } = require('./addCustomer.js')

exports.importExcel = async (req, res) => {
  try {
    // FILE PATH

    const filepath = req.file.path;

    console.log(filepath);

    // READ EXCEL FILE

    const workbook = XLSX.readFile(filepath);

    // FIRST SHEET NAME

    const sheetname = workbook.SheetNames[0];

    console.log(sheetname);

    // GET WORKSHEET

    const worksheet = workbook.Sheets[sheetname];

    // CONVERT EXCEL TO JSON

    const exceldata = XLSX.utils.sheet_to_json(worksheet);

    console.log(exceldata);

    // TRACK DUPLICATES

    const emailSet = new Set();

    const mobileSet = new Set();

    // RESPONSE ARRAYS

    const skippedRows = [];

    const insertedRows = [];

    // LOOP THROUGH EXCEL ROWS

    for (const data of exceldata) {
      // MAPPING

      const employee = {
        firstname: data['First Name'],

        lastname: data['Last Name'],

        email: data['Email'],

        mobile: data['Mobile No'],

        address: data['Address'],

        country: data['Country'],

        state: data['State'],

        gender: data['Gender'],

        hobbies: data['Hobbies'],

        image: data['Image'],
      };

      // EMAIL & MOBILE

      const email = employee.email;

      const mobile = employee.mobile;

      console.log(email, mobile);

      // EXCEL DUPLICATE CHECK

      if (emailSet.has(email) || mobileSet.has(mobile)) {
        skippedRows.push({
          ...employee,

          reason: 'Duplicate Found In Excel',
        });

        continue;
      }

      // ADD INTO SET

      emailSet.add(email);

      mobileSet.add(mobile);

      // DATABASE DUPLICATE CHECK

      const checksql = 'CALL checkEmployeeDuplicateData(?)';

      const checkData = JSON.stringify({
        email,

        mobile,
      });

      const existingUser = await new Promise((resolve, reject) => {
        dbconnection.query(
          checksql,

          [checkData],

          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          },
        );
      });

      // IF DATA EXISTS IN DB

      if (existingUser[0].length > 0) {
        skippedRows.push({
          ...employee,

          reason: 'Duplicate Found In Database',
        });

        continue;
      }

      // INSERT DATA

      await insertEmployeeData(employee);

      // TRACK INSERTED ROW

      insertedRows.push(employee);
    }

    // FINAL RESPONSE

    return res.json({
      message: 'Import Completed Successfully',

      insertedCount: insertedRows.length,

      skippedCount: skippedRows.length,

      insertedRows,

      skippedRows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: 'Import Failed',

      error: error.message,
    });
  }
};


// Exporting Customer Data Into Table

exports.importCustomers = async (req, res) => {
  try {
    // FILE PATH

    const filepath = req.file.path;

    // READ EXCEL FILE

    const workbook = XLSX.readFile(filepath);

    // FIRST SHEET NAME

    const sheetname = workbook.SheetNames[0];

    // GET WORKSHEET

    const worksheet = workbook.Sheets[sheetname];

    // CONVERT EXCEL TO JSON

    const exceldata = XLSX.utils.sheet_to_json(worksheet);

    // TRACK DUPLICATES

    const emailSet = new Set();

    const mobileSet = new Set();

    // RESPONSE ARRAYS

    const skippedRows = [];

    const insertedRows = [];

    // LOOP THROUGH EXCEL ROWS

    for (const data of exceldata) {
      // MAPPING

      const customer = {
        customerId: data['Customer Id'],

        customerName: data['Customer Name'],

        customerEmail: data['Customer Email'],

        customerMobile: data['Customer Mobile'],

        customerDOB: data['Customer DOB'],

        customerCity: data['Customer City'],
      };

      // EMAIL & MOBILE

      const customerEmail = customer.customerEmail;

      const customerMobile = customer.customerMobile;

      // EXCEL DUPLICATE CHECK

      if (emailSet.has(customerEmail) || mobileSet.has(customerMobile)) {
        skippedRows.push({
          ...customer,

          reason: 'Duplicate Found In Excel',
        });

        continue;
      }

      // ADD INTO SET

      emailSet.add(customerEmail);

      mobileSet.add(customerMobile);

      // DATABASE DUPLICATE CHECK

      const checksql = 'CALL checkCustomerDuplicateData(?)';

      const checkData = JSON.stringify({
        customerEmail,

        customerMobile,
      });

      const existingUser = await new Promise((resolve, reject) => {
        dbconnection.query(
          checksql,

          [checkData],

          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          },
        );
      });

      // IF DATA EXISTS IN DB

      if (existingUser[0].length > 0) {
        skippedRows.push({
          ...customer,

          reason: 'Duplicate Found In Database',
        });

        continue;
      }

      // INSERT DATA

      await insertCustomerData(customer);

      // TRACK INSERTED ROW

      insertedRows.push(customer);
    }

    // FINAL RESPONSE

    return res.json({
      message: 'Import Completed Successfully',

      insertedCount: insertedRows.length,

      skippedCount: skippedRows.length,

      insertedRows,

      skippedRows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: 'Import Failed',

      error: error.message,
    });
  }
};


