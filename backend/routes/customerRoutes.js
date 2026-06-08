const express = require('express');
const upload = require('../middleware/upload');
const importUpload = require('../middleware/importupload');
const exceljs = require('exceljs');
const router = express.Router();


const { deleteCustomer } = require('../controller/deleteCustomer');
const { getEditCustomers } = require('../controller/getEditCustomer');
const { nextCustomerId } = require('../controller/nextIdController');
const { getCustomers } = require('../controller/getCustomer');
const { updateCustomer } = require('../controller/updateCustomer');
const { addCustomer } = require('../controller/addCustomer');

const { importCustomers } = require('../controller/importcontroller');
const { exportCustomers } = require('../controller/exportCustomer');
const { customerDetails } = require("../controller/customerDetails");
const { printCustomersDetails } = require('../controller/printCustomersDetails')


router.post('/exportCustomers',exportCustomers);
router.post('/addCustomer', upload.single('customerImage'), addCustomer);
router.get('/nextCustomerId', nextCustomerId);
router.get('/customers', getCustomers);
router.get('/customers/:customerId', getEditCustomers);
router.delete('/deleteCustomer/:customerId',deleteCustomer);
router.put('/updateCustomer/:customerId', upload.single('customerImage'), updateCustomer);

router.post('/importCustomer', importUpload.single('file'),importCustomers);
router.get('/customerDetails/:customerId',customerDetails);
router.get('/printCustomersDetails',printCustomersDetails);

module.exports = router;