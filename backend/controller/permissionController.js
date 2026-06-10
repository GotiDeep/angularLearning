const dbcon = require("../config/stylesConnection");
const bcrypt = require("bcryptjs");

// ════════════════════════════════════════════════════════════════
// GET ALL MODULES
// ════════════════════════════════════════════════════════════════
exports.getModules = async (req, res) => {
  try {
    const [modules] = await dbcon.promise().query(
      "SELECT module_id, module_name, module_category FROM modules WHERE is_active = 1 ORDER BY display_order ASC"
    );
    res.json({ modules });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// GET ALL ROLES (Left panel mein dikhane ke liye)
// ════════════════════════════════════════════════════════════════
exports.getRoles = async (req, res) => {
  try {
    const [roles] = await dbcon.promise().query("SELECT * FROM roles");
    res.json({ roles });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// GET PERMISSIONS FOR A ROLE
// Jab koi role left panel mein click kare → uski permissions lo
// ════════════════════════════════════════════════════════════════
exports.getRolePermissions = async (req, res) => {
  try {
    const roleId = req.params.roleId;

    const sql = `
      SELECT 
        rp.id AS permission_id,
        rp.module_id,
        m.module_name,
        m.module_category,
        rp.can_read,
        rp.can_write,
        rp.can_delete,
        rp.can_export,
        rp.can_import
      FROM role_permissions rp
      JOIN modules m ON rp.module_id = m.module_id
      WHERE rp.role_id = ?
      AND m.is_active = 1
      ORDER BY m.display_order ASC
    `;

    const [permissions] = await dbcon.promise().query(sql, [roleId]);
    res.json({ permissions });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// SAVE ROLE PERMISSIONS
// Pehle us role ki purani permissions delete karo, phir nayi save karo
// ════════════════════════════════════════════════════════════════
exports.saveRolePermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;
    // permissions = [{ moduleId, canRead, canWrite, canDelete, canExport, canImport }]

    // Step 1: Purani permissions delete karo
    await dbcon.promise().query(
      "DELETE FROM role_permissions WHERE role_id = ?",
      [roleId]
    );

    // Step 2: Nayi permissions insert karo
    if (permissions && permissions.length > 0) {
      const values = permissions.map(p => [
        roleId,
        p.moduleId,
        p.canRead ? 1 : 0,
        p.canWrite ? 1 : 0,
        p.canDelete ? 1 : 0,
        p.canExport ? 1 : 0,
        p.canImport ? 1 : 0
      ]);

      await dbcon.promise().query(
        `INSERT INTO role_permissions 
          (role_id, module_id, can_read, can_write, can_delete, can_export, can_import)
         VALUES ?`,
        [values]
      );
    }

    res.json({ message: "Permissions Saved Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// ADD NEW EMPLOYEE (Permission page ke "Add Employee" modal se)
// Password hash karke employee table mein save karo
// ════════════════════════════════════════════════════════════════
exports.addEmployee = async (req, res) => {
  try {
    const { firstname, lastname, email, mobile, password, role_id } = req.body;

    // Validation
    if (!firstname || !email || !password || !role_id) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check karo email already exist karta hai ya nahi
    const [existing] = await dbcon.promise().query(
      "SELECT id FROM employee WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Password hash karo
    const password_hash = await bcrypt.hash(password, 10);

    // Employee insert karo
    await dbcon.promise().query(
      `INSERT INTO employee (firstname, lastname, email, mobile, role_id, password_hash, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [firstname, lastname || '', email, mobile || '', role_id, password_hash]
    );

    res.json({ message: "Employee Added Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
