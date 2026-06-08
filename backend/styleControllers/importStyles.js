const XLSX = require('xlsx');
const stylesConnection = require('../config/stylesConnection');

const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    stylesConnection.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const getNextStyleId = async () => {
  const result = await queryAsync(`
    SELECT id
    FROM mst_category
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.length === 0 ? 1 : result[0].id + 1;
};

const resolveParamId = async (keyParam, value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (!Number.isNaN(Number(value))) {
    return Number(value);
  }

  const normalizedValue = String(value).trim().toUpperCase();
  const codeValue = normalizedValue.replace(/[\s-]+/g, '_');

  const result = await queryAsync(
    `
      SELECT param_id
      FROM master_parameter
      WHERE key_param = ?
        AND (
          UPPER(TRIM(param_name)) = ?
          OR UPPER(TRIM(param_code)) = ?
          OR REPLACE(REPLACE(UPPER(TRIM(param_name)), ' ', '_'), '-', '_') = ?
          OR REPLACE(REPLACE(UPPER(TRIM(param_code)), ' ', '_'), '-', '_') = ?
        )
      LIMIT 1
    `,
    [keyParam, normalizedValue, normalizedValue, codeValue, codeValue]
  );

  return result.length > 0 ? result[0].param_id : null;
};

const resolveRequiredParamId = async (keyParam, value, fieldName, styleNumber) => {
  const id = await resolveParamId(keyParam, value);

  if (!id) {
    throw new Error(
      `${fieldName} '${value}' not found in master_parameter for style ${styleNumber}`
    );
  }

  return id;
};

const resolveStatus = (value) => {
  if (value === true || value === 1 || value === '1') {
    return 1;
  }

  const status = String(value || '').trim().toUpperCase();
  return status === 'ACTIVE' ? 1 : 0;
};

const isEmpty = (value) => {
  return value === null || value === undefined || String(value).trim() === '';
};

const insertStyleDetails = async (styleId, metals, diamonds) => {
  const sqlDetails = 'CALL style_details(?,?,?)';

  if (metals.length > 0) {
    await queryAsync(sqlDetails, [styleId, 'METAL', JSON.stringify(metals)]);
  }

  if (diamonds.length > 0) {
    await queryAsync(sqlDetails, [styleId, 'DIAMOND', JSON.stringify(diamonds)]);
  }
};

exports.importStyles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Import Failed',
        error: 'Excel file is required',
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetname];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const styleNumberSet = new Set();
    const skippedRows = [];
    const insertedRows = [];

    let currentStyleId = null;
    let currentStyleNumber = null;
    let currentMetals = [];
    let currentDiamonds = [];
    let shouldSkipCurrentGroup = false;
    let hasMetalInCurrentGroup = false;  // NEW: Track if metal exists

    const flushCurrentDetails = async () => {
      if (!currentStyleId || shouldSkipCurrentGroup) {
        return;
      }

      // NEW VALIDATION: Check if at least one metal exists
      if (!hasMetalInCurrentGroup) {
        throw new Error(
          `Style ${currentStyleNumber} rejected: At least one METAL row is compulsory. ` +
          `Please add METAL material type for this style.`
        );
      }

      await insertStyleDetails(currentStyleId, currentMetals, currentDiamonds);
      currentMetals = [];
      currentDiamonds = [];
      hasMetalInCurrentGroup = false;  // Reset for next style
    };

    for (const row of rows) {
      if (row.StyleNumber) {
        await flushCurrentDetails();

        currentStyleId = null;
        currentStyleNumber = row.StyleNumber;
        currentMetals = [];
        currentDiamonds = [];
        hasMetalInCurrentGroup = false;  // Reset metal flag

        if (styleNumberSet.has(currentStyleNumber)) {
          skippedRows.push({
            styleNumber: currentStyleNumber,
            reason: 'Duplicate Found In Excel',
          });
          shouldSkipCurrentGroup = true;
          continue;
        }

        styleNumberSet.add(currentStyleNumber);

        const existingNum = await queryAsync(
          'SELECT id FROM mst_category WHERE style_number = ? LIMIT 1',
          [currentStyleNumber]
        );

        if (existingNum.length > 0) {
          skippedRows.push({
            styleNumber: currentStyleNumber,
            reason: 'Duplicate Found In Database',
          });
          shouldSkipCurrentGroup = true;
          continue;
        }

        shouldSkipCurrentGroup = false;

        const nextId = await getNextStyleId();
        const categoryId = await resolveParamId('CATEGORY', row.Category);
        const subCategoryId = await resolveParamId('SUB_CATEGORY', row.SubCategory);
        const genderId = await resolveParamId('GENDER', row.Gender);
        const isActive = resolveStatus(row.Status);

        await queryAsync(
          'CALL mst_category(?, ?, ?, ?, ?, ?, ?, ?)',
          [
            nextId,
            currentStyleNumber,
            categoryId,
            subCategoryId,
            genderId,
            row.ProductTitle,
            row.ProductDescription,
            isActive,
          ]
        );

        currentStyleId = nextId;
        insertedRows.push({ styleNumber: currentStyleNumber, id: currentStyleId });
      }

      if (shouldSkipCurrentGroup || !currentStyleId) {
        continue;
      }

      if (String(row.MaterialType || '').trim().toUpperCase() === 'METAL') {
        // NEW: Set flag that metal exists for this style
        hasMetalInCurrentGroup = true;
        
        const metalTypeId = await resolveRequiredParamId(
          'METAL_TYPE',
          row.MetalType,
          'Metal Type',
          currentStyleNumber
        );
        const metalKT = await resolveRequiredParamId(
          'METAL_KT',
          row.MetalKt,
          'Metal KT',
          currentStyleNumber
        );
        
        currentMetals.push({
          metal: metalTypeId,
          kt: metalKT,
          weight: row.MetalWeight,
        });
      }

      if (String(row.MaterialType || '').trim().toUpperCase() === 'DIAMOND') {
        const diamondTypeId = await resolveRequiredParamId(
          'DIAMOND_TYPE',
          row.DiamondType,
          'Diamond Type',
          currentStyleNumber
        );
        const diamondShape = await resolveRequiredParamId(
          'DIAMOND_SHAPE',
          row.DiamondShape,
          'Diamond Shape',
          currentStyleNumber
        );
        const diamondColor = await resolveRequiredParamId(
          'DIAMOND_COLOR',
          row.DiamondColor,
          'Diamond Color',
          currentStyleNumber
        );
        const diamondClarity = await resolveRequiredParamId(
          'DIAMOND_CLARITY',
          row.DiamondClarity,
          'Diamond Clarity',
          currentStyleNumber
        );
        const diamondSize = await resolveRequiredParamId(
          'DIAMOND_SIZE',
          row.DiamondSize,
          'Diamond Size',
          currentStyleNumber
        );

        currentDiamonds.push({
          diamondType: diamondTypeId,
          shape: diamondShape,
          color: diamondColor,
          clarity: diamondClarity,
          size: diamondSize,
          pcs: row.DiamondPcs,
          caret: row.DiamondCaret,
        });
      }
    }

    await flushCurrentDetails();  // This will also validate last style

    return res.json({
      message: 'Import Completed Successfully',
      insertedCount: insertedRows.length,
      skippedCount: skippedRows.length,
      insertedRows,
      skippedRows,
    });
  } catch (error) {
    console.error('Import Error: ', error);
    return res.status(500).json({
      message: 'Import Failed',
      error: error.message,
    });
  }
};

exports.previewImportStyles = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Preview Failed',
        error: 'Excel file is required',
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetname];

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const styleNumberSet = new Set();
    let currentStyleNumber = null;

    const previewRows = [];

    for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const errors = [];
    const warnings = [];

    const rowNumber = index + 2;
    const hasStyleNumber = !isEmpty(row.StyleNumber);

    if (hasStyleNumber) {
        currentStyleNumber = row.StyleNumber;

        if (styleNumberSet.has(row.StyleNumber)) {
        errors.push('Duplicate StyleNumber In Excel');
        } else {
        styleNumberSet.add(row.StyleNumber);
        }

        if (isEmpty(row.Category)) errors.push('Category Required');
        if (isEmpty(row.SubCategory)) errors.push('SubCategory Required');
        if (isEmpty(row.Gender)) errors.push('Gender Required');
        if (isEmpty(row.ProductTitle)) errors.push('ProductTitle Required');
        if (isEmpty(row.Status)) errors.push('Status Required');

        const existingNum = await queryAsync(
        'SELECT id FROM mst_category WHERE style_number = ? LIMIT 1',
        [row.StyleNumber]
        );

        if (existingNum.length > 0) {
        warnings.push('Munna Style Number Already hai Ye Data Skip Hoga');
        }

        if (!isEmpty(row.Category)) {
        const categoryId = await resolveParamId('CATEGORY', row.Category);
        if (!categoryId) errors.push('Invalid Category');
        }

        if (!isEmpty(row.SubCategory)) {
        const subCategoryId = await resolveParamId('SUB_CATEGORY', row.SubCategory);
        if (!subCategoryId) errors.push('Invalid SubCategory');
        }

        if (!isEmpty(row.Gender)) {
        const genderId = await resolveParamId('GENDER', row.Gender);
        if (!genderId) errors.push('Invalid Gender');
        }

        const status = String(row.Status || '').trim().toUpperCase();
        if (!['ACTIVE', 'INACTIVE', '1', '0'].includes(status)) {
        errors.push('Invalid Status');
        }
    } else {
        if (!currentStyleNumber) {
        errors.push('Child Row Without StyleNumber');
        }
    }

    if (isEmpty(row.MaterialType)) {
        errors.push('MaterialType Required');
    }

    const materialType = String(row.MaterialType || '').trim().toUpperCase();

    if (!isEmpty(row.MaterialType) && !['METAL', 'DIAMOND'].includes(materialType)) {
        errors.push('Invalid MaterialType');
    }

    if (materialType === 'METAL') {
        if (isEmpty(row.MetalType)) errors.push('MetalType Required');
        if (isEmpty(row.MetalKt)) errors.push('MetalKt Required');
        if (isEmpty(row.MetalWeight)) errors.push('MetalWeight Required');

        if (!isEmpty(row.MetalType)) {
        const metalTypeId = await resolveParamId('METAL_TYPE', row.MetalType);
        if (!metalTypeId) errors.push('Invalid MetalType');
        }

        if (!isEmpty(row.MetalKt)) {
        const metalKtId = await resolveParamId('METAL_KT', row.MetalKt);
        if (!metalKtId) errors.push('Invalid MetalKt');
        }
    }

    if (materialType === 'DIAMOND') {
        if (isEmpty(row.DiamondType)) errors.push('DiamondType Required');
        if (isEmpty(row.DiamondShape)) errors.push('DiamondShape Required');
        if (isEmpty(row.DiamondColor)) errors.push('DiamondColor Required');
        if (isEmpty(row.DiamondClarity)) errors.push('DiamondClarity Required');
        if (isEmpty(row.DiamondSize)) errors.push('DiamondSize Required');
        if (isEmpty(row.DiamondPcs)) errors.push('DiamondPcs Required');
        if (isEmpty(row.DiamondCaret)) errors.push('DiamondCaret Required');

        if (!isEmpty(row.DiamondType)) {
        const diamondTypeId = await resolveParamId('DIAMOND_TYPE', row.DiamondType);
        if (!diamondTypeId) errors.push('Invalid DiamondType');
        }

        if (!isEmpty(row.DiamondShape)) {
        const diamondShapeId = await resolveParamId('DIAMOND_SHAPE', row.DiamondShape);
        if (!diamondShapeId) errors.push('Invalid DiamondShape');
        }

        if (!isEmpty(row.DiamondColor)) {
        const diamondColorId = await resolveParamId('DIAMOND_COLOR', row.DiamondColor);
        if (!diamondColorId) errors.push('Invalid DiamondColor');
        }

        if (!isEmpty(row.DiamondClarity)) {
        const diamondClarityId = await resolveParamId('DIAMOND_CLARITY', row.DiamondClarity);
        if (!diamondClarityId) errors.push('Invalid DiamondClarity');
        }

        if (!isEmpty(row.DiamondSize)) {
        const diamondSizeId = await resolveParamId('DIAMOND_SIZE', row.DiamondSize);
        if (!diamondSizeId) errors.push('Invalid DiamondSize');
        }
    }

    previewRows.push({
        rowNumber,
        ...row,
        errorName: errors.join(', '),
        warningName: warnings.join(', '),
    });
    }

    const errorRows = previewRows.filter(row => row.errorName).length;
    const warnRows = previewRows.filter(row => row.warningName).length; 
    const validRows = previewRows.length - errorRows;

    return res.json({
        message: 'Preview Generated Successfully',
        totalRows: previewRows.length,
        validRows,
        errorRows,
        warnRows,
        rows: previewRows,
    });
    
  } catch (error) {
    return res.status(500).json({
      message: 'Preview Failed',
      error: error.message,
    });
  }
};
