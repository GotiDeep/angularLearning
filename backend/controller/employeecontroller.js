const exceljs = require('exceljs');
const dbconnection = require('../config/stylesConnection');

exports.exportExcel = async (req, res) => {
  const { selection, selectedIds } = req.body;

  let sql = '';
  let values = [];

  if (selection === 'All') {
    sql = 'CALL exportAllEmployee()';
  } else if (selection === 'Selected') {
    sql = 'CALL exportSelected(?)';

    values = [selectedIds.join(',')];
  } else if (selection === 'Non Selected') {
    sql = 'CALL exportNonSelected(?)';

    values = [selectedIds.join(',')];
  } else {
    console.log('Something Went Wrong...');
  }

  dbconnection.query(sql, values, async (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    const workbook = new exceljs.Workbook();

    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      {
        header: 'Id',
        key: 'id',
        width: 10,
      },
      {
        header: 'First Name',
        key: 'firstname',
        width: 10,
      },
      {
        header: 'Last Name',
        key: 'lastname',
        width: 10,
      },
      {
        header: 'Email',
        key: 'email',
        width: 20,
      },
      {
        header: 'Mobile No',
        key: 'mobile',
        width: 15,
      },
      {
        header: 'Address',
        key: 'address',
        width: 20,
      },
      {
        header: 'Country',
        key: 'country',
        width: 20,
      },
      {
        header: 'State',
        key: 'state',
        width: 20,
      },
      {
        header: 'Gender',
        key: 'gender',
        width: 10,
      },
      {
        header: 'Hobbies',
        key: 'hobbies',
        width: 20,
      },
      {
        header: 'Image',
        key: 'image',
        width: 20,
      },
    ];

    const employees = result[0];

    employees.forEach((emp) => {
      worksheet.addRow(emp);
    });

    // RESPONSE HEADERS

    res.setHeader(
      'Content-Type',

      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',

      'attachment; filename=employees.xlsx',
    );

    // SEND FILE

    await workbook.xlsx.write(res);

    res.end();
  });

};
