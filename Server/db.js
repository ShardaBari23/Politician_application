const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
    return;
  }
  console.log("✅ Connected to Aiven MySQL");
});

module.exports = connection;