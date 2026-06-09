const dbcon = require("../config/stylesConnection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const
    {
      username,
      email,
      mobile,
      password,
      confpass
    } = req.body;

  if (password == confpass) {
    const hashpass = await bcrypt.hash(password, 10);
    const signupData = {
      username,
      email,
      mobile,
      passwords: hashpass
    };

    const signupUsers = JSON.stringify(signupData)
    const sql = "CALL signupUsers(?)";

    dbcon.query(
      sql,
      [signupUsers],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          message: "Account Created SucceFully"
        });
      }
    );
  }
  else {
    return res.status(400).json({
      message: "Confirm passwords and passwords are not same"
    });
  }

};

exports.login = async (req, res) => {
  // Step 1: email aur password request body se nikalo
  const { email, password } = req.body;

  try {
    // ─────────────────────────────────────────────────
    // QUERY 1: workusers + roles JOIN karke user dhundo
    // email se user nikalo, sirf active users
    // ─────────────────────────────────────────────────
    const userSql = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.password_hash,
        u.manager_id,
        r.role_id,
        r.role_name,
        r.is_super_role
      FROM workusers u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.email = ?
      AND u.is_active = 1
    `;

    // dbcon.promise() → Callback ke bajay async/await use karne ke liye
    const [users] = await dbcon.promise().query(userSql, [email]);

    // Agar user nahi mila → 401 Unauthorized
    if (!users || users.length === 0) {
      return res.status(401).json({ message: "User Not Found" });
    }

    // Result ka pehla (aur sirf ek) user lo
    const user = users[0];

    // ─────────────────────────────────────────────────
    // STEP 2: Password verify karo (bcrypt se)
    // Frontend se aaya plain password vs DB ka hashed password
    // ─────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // ─────────────────────────────────────────────────
    // STEP 3: Permissions fetch karo
    // Admin (is_super_role = 1) ko permissions table ki zaroorat nahi
    // Manager / Employee → user_permissions table se fetch karo
    // ─────────────────────────────────────────────────
    let permissions = [];

    if (!user.is_super_role) {
      // Admin nahi hai → DB se permissions lo
      const permSql = `
        SELECT 
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
      `;

      const [perms] = await dbcon.promise().query(permSql, [user.user_id]);
      permissions = perms;
    }

    // ─────────────────────────────────────────────────
    // STEP 4: JWT Token banao
    // Token ke andar user_id aur role_name store karo
    // "secretkey" → baad mein .env file mein move karenge
    // ─────────────────────────────────────────────────
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_name: user.role_name,
        is_super_role: user.is_super_role
      },
      "secretkey",
      { expiresIn: "1d" }
    );

    // ─────────────────────────────────────────────────
    // STEP 5: Response bhejo
    // Frontend ko: token + user info + permissions
    // ─────────────────────────────────────────────────
    res.json({
      message: "Login Success",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role_name: user.role_name,
        is_super_role: user.is_super_role === 1,  // 1 → true, 0 → false
        manager_id: user.manager_id
      },
      permissions  // Admin ke liye [] (empty), baaki ke liye actual permissions
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
