const mysql = require('mysql2');

const stylesConnection = mysql.createPool({

  host: 'localhost',

  user: 'root',

  password: '',

  database: 'company_management',

  port: 8080,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

});

/* CHECK CONNECTION */

stylesConnection.getConnection((err, connection) => {

  if (err) {

    console.log('Database Connection Failed');

    console.log(err);

  } 
  
  else {

    console.log('Connection Success');

    connection.release();

  }

});

module.exports = stylesConnection;