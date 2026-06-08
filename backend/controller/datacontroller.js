const dbcon = require('../config/stylesConnection');

const insertEmployeeData = (data) => {
  return new Promise((resolve, reject) => {
    const employeeData = JSON.stringify(data);

    const sql = 'CALL crudEmployee(?)';

    dbcon.query(
      sql,

      [employeeData],

      (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

exports.insertEmployeeData = insertEmployeeData;

exports.showdata = (req, res) => {
  const sql = 'SELECT * FROM employee ORDER BY id ASC';

  dbcon.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

exports.getemployee = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM employee WHERE id=?';

  dbcon.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Employee Not Found',
      });
    }

    res.json(result[0]);
  });
};

exports.addemployee = async (req, res) => {
  try {
    req.body.image = req.file ? req.file.filename : '';

    await insertEmployeeData(req.body);

    res.json({
      message: 'Employee Added Successfully',
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteemployee = (req, res) => {
  const id = req.params.id || req.body.id;

  const sql = 'CALL crudEmployee(?)';
  const empData = {id,}

  dbcon.query(sql, [JSON.stringify(empData)], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Employee Not Found',
      });
    }

    res.json({
      message: 'Employee Deleted Successfully',
    });
  });
};

exports.updateemployee = (req, res) => {
  const { firstname, lastname, email, mobile, address, country, state, gender, hobbies, image } =
    req.body;
  const id = req.params.id || req.body.id;
  const empData = {
    id,
    firstname,
    lastname,
    email,
    mobile,
    address,
    country,
    state,
    gender,
    hobbies,
    image
  }

  const sql = "CALL crudEmployee(?)";

  dbcon.query(
    sql,
    [JSON.stringify(empData)],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Employee Not Found',
        });
      }

      res.json({
        message: 'Employee Details Updated Successfully',
      });
    },
  );
};
