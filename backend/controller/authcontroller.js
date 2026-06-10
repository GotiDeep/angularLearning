const dbcon = require("../config/stylesConnection");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const { username, email, mobile, password, confpass } = req.body;

  try {
    // Password match check
    if (password !== confpass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Email already exist check
    const [existing] = await dbcon.promise().query(
      "SELECT id FROM employee WHERE email = ?", [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Password hash karo
    const password_hash = await bcrypt.hash(password, 10);

    // employee table mein insert karo
    // username → firstname rakho, lastname baad mein update hoga
    // role_id = 3 (Employee default), is_active = 1
    await dbcon.promise().query(
      `INSERT INTO employee (firstname, email, mobile, password_hash, role_id, is_active)
       VALUES (?, ?, ?, ?, 3, 1)`,
      [username, email, mobile, password_hash]
    );

    const JWT_SECRET = "JWT_SECRET05112004"; // JWT Secret Code Kai Pan Rakhi Sakiye
    const EMAIL_USER = "localgemsss05@gmail.com"; // Email Je Email Per thi Link Send Karvi che Email
    const EMAIL_PASSWORD = "xgci rumy ghsz cvsx"; // Email Password App password ma jai ne create karvo pade

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const htmlwelcome = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Welcome to Our Platform</title>
                                <style>
                                    body {
                                        font-family: 'Arial', sans-serif;
                                        line-height: 1.6;
                                        color: #333;
                                        margin: 0;
                                        padding: 0;
                                        background-color: #f4f4f4;
                                    }
                                    .container {
                                        max-width: 600px;
                                        margin: 20px auto;
                                        background-color: #ffffff;
                                        border-radius: 10px;
                                        overflow: hidden;
                                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                                    }
                                    .header {
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        padding: 40px 20px;
                                        text-align: center;
                                    }
                                    .header h1 {
                                        margin: 0;
                                        font-size: 32px;
                                    }
                                    .header p {
                                        margin: 10px 0 0;
                                        opacity: 0.9;
                                    }
                                    .content {
                                        padding: 40px 30px;
                                    }
                                    .welcome-icon {
                                        text-align: center;
                                        font-size: 60px;
                                        margin-bottom: 20px;
                                    }
                                    h2 {
                                        color: #333;
                                        margin-top: 0;
                                        text-align: center;
                                    }
                                    .btn {
                                        display: inline-block;
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        text-decoration: none;
                                        padding: 12px 30px;
                                        border-radius: 5px;
                                        margin: 20px 0;
                                        font-weight: bold;
                                    }
                                    .btn:hover {
                                        opacity: 0.9;
                                    }
                                    .feature-box {
                                        background-color: #f8f9fa;
                                        border-radius: 8px;
                                        padding: 15px;
                                        margin: 20px 0;
                                    }
                                    .feature {
                                        margin: 15px 0;
                                        padding-left: 25px;
                                        position: relative;
                                    }
                                    .feature:before {
                                        content: "✓";
                                        color: #4CAF50;
                                        font-weight: bold;
                                        position: absolute;
                                        left: 0;
                                    }
                                    .footer {
                                        background-color: #f8f9fa;
                                        padding: 20px;
                                        text-align: center;
                                        font-size: 12px;
                                        color: #666;
                                        border-top: 1px solid #eee;
                                    }
                                    .social-links {
                                        margin: 15px 0;
                                    }
                                    .social-links a {
                                        margin: 0 10px;
                                        color: #667eea;
                                        text-decoration: none;
                                    }
                                    @media only screen and (max-width: 600px) {
                                        .content {
                                            padding: 20px;
                                        }
                                        .btn {
                                            display: block;
                                            text-align: center;
                                        }
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h1>Welcome Aboard! 🎉</h1>
                                        <p>Your journey with us starts today</p>
                                    </div>
                                    
                                    <div class="content">
                                        <div class="welcome-icon">
                                            🎊
                                        </div>
                                        
                                        <h2>Hello ${username || 'there'}! 👋</h2>
                                        
                                        <p>Thank you for choosing us! We're thrilled to have you on board. Your account has been successfully created with the email: <strong>${email}</strong></p>
                                        
                                        <div class="feature-box">
                                            <h3 style="margin-top: 0;">What you can do now:</h3>
                                            <div class="feature">Complete your profile to get personalized experience</div>
                                            <div class="feature">Explore our features and tools</div>
                                            <div class="feature">Connect with other members in the community</div>
                                            <div class="feature">Access exclusive content and resources</div>
                                        </div>
                                        
                                        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                            <strong>💡 Pro Tip:</strong> Verify your email address to unlock all features and get priority support!
                                        </div>
                                        
                                        <p>Need help? Check out our <a href="#" style="color: #667eea;">Getting Started Guide</a> or <a href="#" style="color: #667eea;">FAQ section</a>.</p>
                                    </div>
                                    
                                    <div class="footer">
                                        <div class="social-links">
                                            <a href="#">Twitter</a> |
                                            <a href="#">Facebook</a> |
                                            <a href="#">Instagram</a> |
                                            <a href="#">LinkedIn</a>
                                        </div>
                                        <p>Questions? Contact our support team at <a href="mailto:support@yourdomain.com" style="color: #667eea;">support@yourdomain.com</a></p>
                                        <p>© 2024 Your Company Name. All rights reserved.</p>
                                        <p><small>If you didn't create this account, please <a href="#" style="color: #667eea;">contact us immediately</a>.</small></p>
                                    </div>
                                </div>
                            </body>
                            </html>`

    transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Welcome to the World Of Angular",
      html: htmlwelcome,
    });

    res.json({ message: "Account Created Successfully" });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ─── Step 1: employee table se user dhundo (workusers nahi) ───
    const userSql = `
      SELECT 
        e.id          AS user_id,
        e.email,
        CONCAT(e.firstname, ' ', e.lastname) AS username,
        e.password_hash,
        e.role_id,
        e.is_active,
        r.role_name,
        r.is_super_role
      FROM employee e
      JOIN roles r ON e.role_id = r.role_id
      WHERE e.email = ?
      AND e.is_active = 1
      AND e.password_hash IS NOT NULL
    `;

    const [users] = await dbcon.promise().query(userSql, [email]);

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "User Not Found or Not Active" });
    }

    const user = users[0];

    // ─── Step 2: Password verify karo ───
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // ─── Step 3: Role-wise permissions fetch karo ───
    // Admin ke liye kuch fetch nahi (sab access hai)
    // Manager/Employee ke liye role_permissions table se lo
    let permissions = [];

    if (!user.is_super_role) {
      const permSql = `
        SELECT 
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
      `;
      const [perms] = await dbcon.promise().query(permSql, [user.role_id]);
      permissions = perms;
    }

    // ─── Step 4: JWT Token banao ───
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role_id: user.role_id,
        role_name: user.role_name,
        is_super_role: user.is_super_role
      },
      "secretkey",
      { expiresIn: "1d" }
    );

    // ─── Step 5: Response bhejo ───
    res.json({
      message: "Login Success",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        is_super_role: user.is_super_role === 1
      },
      permissions
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

