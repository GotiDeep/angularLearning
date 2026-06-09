const dbcon = require("../config/stylesConnection");

// ════════════════════════════════════════════════════════════════
// GET ALL MODULES
// Ye function sabhi active modules return karta hai
// Frontend issi list se permission matrix banayega
// ════════════════════════════════════════════════════════════════
exports.getModules = async (req, res) => {
  try {
    const sql = `
      SELECT module_id, module_name, module_category, display_order
      FROM modules
      WHERE is_active = 1
      ORDER BY display_order ASC
    `;

    const [modules] = await dbcon.promise().query(sql);
    res.json({ modules });

  } catch (err) {
    console.error("getModules Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// GET ALL USERS (for Permission Management List Screen)
// Sirf Manager aur Employee dikhenge (Admin khud hi sab kar sakta hai)
// ════════════════════════════════════════════════════════════════
exports.getAllUsers = async (req, res) => {
  try {
    // req.user → JWT middleware se aata hai (logged in user ka info)
    const loggedInUser = req.user;

    let sql = "";
    let params = [];

    if (loggedInUser.is_super_role) {
      // ─── ADMIN: Sab users dikhao (apne aap ko chhod ke) ───
      sql = `
        SELECT 
          u.user_id,
          u.username,
          u.email,
          u.manager_id,
          r.role_name,
          r.is_super_role
        FROM workusers u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id != ?
        AND u.is_active = 1
        ORDER BY r.role_id ASC, u.username ASC
      `;
      params = [loggedInUser.user_id];

    } else if (loggedInUser.role_name === "Manager") {
      // ─── MANAGER: Sirf apne under ke employees dikhao ───
      sql = `
        SELECT 
          u.user_id,
          u.username,
          u.email,
          u.manager_id,
          r.role_name,
          r.is_super_role
        FROM workusers u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.manager_id = ?
        AND u.is_active = 1
        ORDER BY u.username ASC
      `;
      params = [loggedInUser.user_id];

    } else {
      // Employee: Permission management access nahi hai
      return res.status(403).json({ message: "Access Denied" });
    }

    const [users] = await dbcon.promise().query(sql, params);
    res.json({ users });

  } catch (err) {
    console.error("getAllUsers Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// GET PERMISSIONS OF A SPECIFIC USER
// Jab "Configure Permission" button click hoga, ye API call hogi
// Return: us user ki saari permissions (module wise)
// ════════════════════════════════════════════════════════════════
exports.getUserPermissions = async (req, res) => {
  try {
    const targetUserId = req.params.userId; // URL se userId lo
    const loggedInUser = req.user;          // JWT se logged in user

    // ─── Security Check: Kya logged in user ko ye permission dene ka haq hai? ───
    const canAccess = await checkCanAssign(loggedInUser, parseInt(targetUserId));
    if (!canAccess) {
      return res.status(403).json({ message: "Access Denied" });
    }

    const sql = `
      SELECT 
        up.permission_id,
        up.module_id,
        m.module_name,
        m.module_category,
        up.can_read,
        up.can_write,
        up.can_delete,
        up.can_export,
        up.can_import
      FROM user_permissions up
      JOIN modules m ON up.module_id = m.module_id
      WHERE up.user_id = ?
      AND m.is_active = 1
      ORDER BY m.display_order ASC
    `;

    const [permissions] = await dbcon.promise().query(sql, [targetUserId]);
    res.json({ permissions });

  } catch (err) {
    console.error("getUserPermissions Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// SAVE / UPDATE PERMISSIONS
// Frontend se checkbox ka data aayega → DB mein save karo
// Agar pehle se permission hai → UPDATE karo
// Agar nahi hai → INSERT karo (UPSERT logic)
// ════════════════════════════════════════════════════════════════
exports.savePermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    // permissions = [{ moduleId, canRead, canWrite, canDelete, canExport, canImport }, ...]
    const loggedInUser = req.user;

    // ─── Security Check ───
    const canAccess = await checkCanAssign(loggedInUser, parseInt(userId));
    if (!canAccess) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // ─── Pehle us user ki saari purani permissions delete karo ───
    // Phir nayi permissions insert karo (simple approach)
    await dbcon.promise().query(
      "DELETE FROM user_permissions WHERE user_id = ?",
      [userId]
    );

    // ─── Agar koi permission send ki hai to insert karo ───
    if (permissions && permissions.length > 0) {
      const insertValues = permissions.map(p => [
        userId,
        p.moduleId,
        p.canRead ? 1 : 0,
        p.canWrite ? 1 : 0,
        p.canDelete ? 1 : 0,
        p.canExport ? 1 : 0,
        p.canImport ? 1 : 0,
        loggedInUser.user_id  // assigned_by = logged in user
      ]);

      const insertSql = `
        INSERT INTO user_permissions 
          (user_id, module_id, can_read, can_write, can_delete, can_export, can_import, assigned_by)
        VALUES ?
      `;

      await dbcon.promise().query(insertSql, [insertValues]);
    }

    res.json({ message: "Permissions Saved Successfully" });

  } catch (err) {
    console.error("savePermissions Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
// HELPER FUNCTION: Kya logged in user target user ko permission de sakta hai?
// Admin → Sab ko de sakta hai
// Manager → Sirf apne employees ko de sakta hai
// Employee → Kisi ko nahi
// ════════════════════════════════════════════════════════════════
async function checkCanAssign(loggedInUser, targetUserId) {
  if (loggedInUser.is_super_role) return true; // Admin → always allowed

  if (loggedInUser.role_name === "Manager") {
    // Check karo ki target employee is manager ke under hai ya nahi
    const [rows] = await dbcon.promise().query(
      "SELECT user_id FROM workusers WHERE user_id = ? AND manager_id = ?",
      [targetUserId, loggedInUser.user_id]
    );
    return rows.length > 0; // employee mila → allowed
  }

  return false; // Employee → not allowed
}
