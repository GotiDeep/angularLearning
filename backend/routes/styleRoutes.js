const express = require('express');
const importUpload = require('../middleware/importupload');
const exceljs = require('exceljs');
const router = express.Router();

const { getNextId } = require("../styleControllers/getNextId");
const { saveStyleDetails } = require("../styleControllers/saveStyles");
const { createNewParameter } = require("../styleControllers/createNewParameter");
const { getParams,getParentParams } = require("../styleControllers/getParams");
const { addParamValues } = require("../styleControllers/addParamValues");
const { loadAllParameters } = require("../styleControllers/loadAllParameters");
const { getStyles, getStyleById } = require("../styleControllers/getStyles");
const { deleteStyle } = require("../styleControllers/deleteStyles");
const { updateStyle } = require("../styleControllers/updateStyle");
const { getId } = require("../styleControllers/getNextId");
const{ importStyles,previewImportStyles } = require("../styleControllers/importStyles");

const { getUserPermissions } = require("../styleControllers/getUserPermissions");
const { completeOrder } = require("../styleControllers/completeOrder");


router.get('/getNextId', getNextId);
router.post('/createNewParameter', createNewParameter);
router.get('/getParams', getParams);
router.get('/getParentParams/:param_id', getParentParams);
router.post('/addParamValues', addParamValues);
router.get('/loadAllParameters', loadAllParameters);
router.post('/saveStyleDetails', saveStyleDetails);
router.get('/getStyles',getStyles);
router.get('/getStyleById/:id',getStyleById);
router.delete('/deleteStyle/:id', deleteStyle);
router.put('/updateStyle/:id', updateStyle);
router.get('/getId', getId);
router.post('/importStyles', importUpload.single('file') ,importStyles);  
router.post('/previewImportStyles',importUpload.single('file'),previewImportStyles);


router.get('/getUserPermissions', getUserPermissions);

router.post('/completeOrder', completeOrder);

module.exports = router;