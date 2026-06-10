const express = require('express');
const upload = require('../middleware/upload');
const importUpload = require('../middleware/importupload');
const router = express.Router();

const { importExcel } = require('../controller/importcontroller');

const { exportExcel } = require('../controller/employeecontroller');

const { employeeDetails } = require('../controller/employeeDetails');

const { login, signup } = require('../controller/authcontroller');

const { printEmployees } = require('../controller/printEmployees');

const { sendResetLink } = require('../controller/sendResetLink');

const { resetPassword } = require('../controller/resetPassword');

const {
  addemployee,
  deleteemployee,
  updateemployee,
  showdata,
  getemployee,
} = require('../controller/datacontroller');

router.post('/signup', signup);
router.post('/login', login);
router.post('/sendResetLink', sendResetLink);
router.post('/resetPassword', resetPassword);

router.get('/showdata', showdata);
router.get('/employee/:id', getemployee);
router.post('/addemployee', upload.single('image'), addemployee);
router.delete('/deleteemployee/:id', deleteemployee);
router.post('/deleteemployee', deleteemployee);
router.put('/updateemployee/:id',upload.single('image'),updateemployee);
router.post('/updateemployee', updateemployee);

router.post('/exportexcel', exportExcel);

router.post('/importExcel', importUpload.single('file'), importExcel);

router.get('/employeeDetails/:employeeId',employeeDetails);
router.get('/printEmployees',printEmployees);

module.exports = router;
