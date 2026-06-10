const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

const {
  getModules,
  getRoles,
  getRolePermissions,
  saveRolePermissions,
  addEmployee
} = require("../controller/permissionController");

router.get("/permissions/roles", verifyToken, getRoles);

router.get("/permissions/modules", verifyToken, getModules);

router.get("/permissions/role/:roleId", verifyToken, getRolePermissions);

router.post("/permissions/save-role", verifyToken, saveRolePermissions);

router.post("/permissions/add-employee", verifyToken, addEmployee);

module.exports = router;
