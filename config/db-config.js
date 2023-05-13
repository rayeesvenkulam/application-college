const mysql = require("mysql");
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "application", // Add database name here
  multipleStatements: true
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;
