const dbconnection = require("../config/stylesConnection");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.sendResetLink = async(req,res) => {
    const email = req.body.email;

    const sql = "SELECT * FROM Employee WHERE email = ?";

    dbconnection.query(sql,[email],(err,result) => {

        const JWT_SECRET = "JWT_SECRET05112004"; // JWT Secret Code Kai Pan Rakhi Sakiye
        const EMAIL_USER = "localgemsss05@gmail.com"; // Email Je Email Per thi Link Send Karvi che Email
        const EMAIL_PASSWORD = "xgci rumy ghsz cvsx"; // Email Password App password ma jai ne create karvo pade 

        try
        {
            if(err)
            {
                res.status(500).json({message : "Internal Server Error"});
                return;
            }

            if(result.length > 0)
            {   
                const user = result[0];
                const secret = JWT_SECRET + user.password_hash;

                const token = jwt.sign(
                    {id: user.id,
                    email: user.email},
                    secret,
                    {expiresIn: "15m"}
                )

                const resetLink = `http://localhost:4200/reset-password?token=${token}`;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: EMAIL_USER, // localgemsss05@gmail.com
                        pass: EMAIL_PASSWORD    // xgci rumy ghsz cvsx
                    }
                });

                const resethtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Reset Password</title>
                            <style>
                                body {
                                    font-family: Arial, Helvetica, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    padding: 20px;
                                    background-color: #f9f9f9;
                                    border-radius: 10px;
                                }
                                .header {
                                    background-color: #4CAF50;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 10px 10px 0 0;
                                }
                                .content {
                                    background-color: white;
                                    padding: 30px;
                                    border-radius: 0 0 10px 10px;
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                                }
                                h2 {
                                    color: #333;
                                    margin-top: 0;
                                }
                                .button {
                                    display: inline-block;
                                    background-color: #4CAF50;
                                    color: white;
                                    text-decoration: none;
                                    padding: 12px 30px;
                                    margin: 20px 0;
                                    border-radius: 5px;
                                    font-weight: bold;
                                    text-align: center;
                                    transition: background-color 0.3s ease;
                                }
                                .button:hover {
                                    background-color: #45a049;
                                }
                                .footer {
                                    text-align: center;
                                    margin-top: 30px;
                                    padding-top: 20px;
                                    border-top: 1px solid #eee;
                                    font-size: 12px;
                                    color: #666;
                                }
                                .warning {
                                    background-color: #fff3cd;
                                    border-left: 4px solid #ffc107;
                                    padding: 10px;
                                    margin: 20px 0;
                                    font-size: 14px;
                                }
                                @media only screen and (max-width: 600px) {
                                    .container {
                                        width: 100%;
                                        padding: 10px;
                                    }
                                    .button {
                                        display: block;
                                        width: 100%;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Password Reset Request</h1>
                                </div>
                                <div class="content">
                                    <h2>Hello ${user.firstname + ' ' + user.lastname || 'User'},</h2>
                                    <p>We received a request to reset your password for your account associated with <strong>${user.email}</strong>.</p>
                                    
                                    <div style="text-align: center;">
                                        <a href="${resetLink}" class="button" style="color: white;">Reset My Password</a>
                                    </div>
                                    
                                    <div class="warning">
                                        <strong>⚠️ This link will expire in 15 Minutes</strong><br>
                                        If you didn't request this password reset, please ignore this email or contact support.
                                    </div>
                                    
                                    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                                    <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                                        ${resetLink}
                                    </p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated message, please do not reply to this email.</p>
                                    <p>&copy; 2024 Your Company Name. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                transporter.sendMail({
                    from: EMAIL_USER,
                    to: user.email,
                    subject: "Reset Password",
                    html: resethtml
                });
                
                res.status(200).json({message : "Link Bhej Di Hai Agli Baar Yaad Rakhna..."});
            } 

            if(result.length <= 0)
            {
                res.status(404).json({message : "User Not Found"});
                return;
            }
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({message : "Internal Server Error"});
            return;
        }
    })
}