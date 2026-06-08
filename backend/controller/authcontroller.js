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

exports.login = (req, res) => {
  const loginData = JSON.stringify(req.body);
  const { password } = req.body;

  console.log(loginData);
  const sql =
    "CALL loginUsers(?)";

  dbcon.query(sql, [loginData], async (err, result) => {

    console.log(result);

    if (err) {
      return res.status(500).json(err);
    }

    if (!result[0] || result[0].length === 0) {
      return res.status(401).json({
        message: "User Not Found"
      });
    }

    const user = result[0][0];

    const match = await bcrypt.compare(
      password,
      user.passwords
    );

    if (!match) {
      return res.status(401).json({
        message: "Invalid passwords"
      });
    }

    const token = jwt.sign(
      {
        id: user.id
      },
      "secretkey",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login Success",
      token
    });
  });
};
