const express = require("express");
const router = express.Router();

// Middleware: Token verify karega
const { verifyToken } = require("../middleware/authMiddleware");

// Controller functions
const {
  getModules,
  getAllUsers,
  getUserPermissions,
  savePermissions,
} = require("../controller/permissionController");

// ─── ROUTES ───
// verifyToken → pehle token check hoga, phir controller chalega

// GET /api/permissions/modules → Sabhi modules ki list
router.get("/permissions/modules", verifyToken, getModules);

// GET /api/permissions/users → Sabhi users ki list (Admin/Manager ke liye)
router.get("/permissions/users", verifyToken, getAllUsers);

// GET /api/permissions/user/:userId → Ek user ki permissions
router.get("/permissions/user/:userId", verifyToken, getUserPermissions);

// POST /api/permissions/save → Permissions save karo
router.post("/permissions/save", verifyToken, savePermissions);

module.exports = router;
