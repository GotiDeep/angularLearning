const bcrypt = require("bcrypt");
const dbconnection = require("../config/stylesConnection");
const jwt = require("jsonwebtoken");

exports.resetPassword = async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords Do Not Match'
        });
    }
    
    try {
        const JWT_SECRET = "JWT_SECRET05112004";    
        const password_hash = await bcrypt.hash(newPassword, 10);
        
        // 1. Token decode karke user details nikalein
        const decodeToken = jwt.decode(token);

        if (!decodeToken || !decodeToken.email || !decodeToken.id) {
            return res.status(400).json({ success: false, message: "Invalid Token format." });
        }

        const id = decodeToken.id;
        const email = decodeToken.email;

        const sql = "SELECT * FROM employee WHERE email = ? AND id = ?";

        dbconnection.query(sql, [email, id], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database Error" });
            }

            if (result && result.length > 0) {
                const secret = JWT_SECRET + result[0].password_hash;

                jwt.verify(token, secret, (error, decode) => {
                    if (error) {
                        return res.status(401).json({
                            success: false, 
                            message: 'Link Expired or Used.'
                        });
                    }

                    const updateSql = "UPDATE employee SET password_hash = ? WHERE id = ?";
                    
                    dbconnection.query(updateSql, [password_hash, id], (updateErr, updateResult) => {
                        if (updateErr) {
                            return res.status(500).json({ success: false, message: "Update Database Error" });
                        }

                        // UPDATE query me 'affectedRows' check karte hain, length nahi 💡
                        if (updateResult && updateResult.affectedRows > 0) {
                            return res.status(200).json({
                                success: true,
                                message: 'Password Yaad Rakha Kro Ye Bhulne Ki Thodi Chize hai 😁'
                            });
                        } else {
                            return res.status(400).json({
                                success: false,
                                message: 'Password update nahi ho paya'
                            });
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'User Not Found'
                });
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
