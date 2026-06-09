const jwt = require("jsonwebtoken");

// ════════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// Har protected route se pehle ye middleware chalega
// Kaam: Token verify karo → req.user mein user info daalo
// ════════════════════════════════════════════════════════════════
const verifyToken = (req, res, next) => {

  // HTTP Header se Authorization token lo
  // Frontend bhejta hai: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No Token Provided" });
  }

  // "Bearer eyJhbGci..." → sirf token part nikalo
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid Token Format" });
  }

  try {
    // jwt.verify → Token decode karo aur verify karo
    // Agar token galat ya expire → error throw karega
    const decoded = jwt.verify(token, "secretkey");

    // req.user mein decoded info daalo → aage ke middleware/controller use karenge
    // decoded mein hai: { user_id, role_name, is_super_role }
    req.user = decoded;

    // next() → aage ka middleware ya controller chalao
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = { verifyToken };
